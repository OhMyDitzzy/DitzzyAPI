import { Redis } from '@upstash/redis';

interface EndpointStats {
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  lastAccessed: number;
}

interface VisitorData {
  timestamp: number;
  count: number;
}

interface IPFailureTracking {
  count: number;
  resetTime: number;
}

interface GlobalStats {
  totalRequests: number;
  totalSuccess: number;
  totalFailed: number;
  uniqueVisitors: Set<string>;
  endpoints: Map<string, EndpointStats>;
  startTime: number;
  visitorsByDay: Map<string, Set<string>>;
}

interface SerializedStats {
  totalRequests: number;
  totalSuccess: number;
  totalFailed: number;
  uniqueVisitors: string[];
  endpoints: Record<string, EndpointStats>;
  startTime: number;
  visitorsByDay: Record<string, string[]>;
}

class StatsTracker {
  private stats: GlobalStats;
  private ipFailures: Map<string, IPFailureTracking>;
  private readonly MAX_FAILS_PER_IP = 1;
  private readonly FAIL_WINDOW_MS = 12 * 60 * 60 * 1000;
  private redis: Redis | null = null;
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly REDIS_KEY = 'api-stats:global';

  constructor() {
    this.stats = {
      totalRequests: 0,
      totalSuccess: 0,
      totalFailed: 0,
      uniqueVisitors: new Set(),
      endpoints: new Map(),
      startTime: Date.now(),
      visitorsByDay: new Map(),
    };
    this.ipFailures = new Map();

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      console.log('Redis initialized for persistent stats');
    } else {
      console.warn('Redis not configured - stats will be in-memory only');
    }
    
    setInterval(() => {
      const now = Date.now();
      this.ipFailures.forEach((tracking, ip) => {
        if (now > tracking.resetTime) {
          this.ipFailures.delete(ip);
        }
      });
    }, 5 * 60 * 1000);
  }

  async loadStats(): Promise<void> {
    if (!this.redis) {
      console.log('No Redis configured, starting with fresh stats');
      return;
    }

    try {
      const data = await this.redis.get<SerializedStats>(this.REDIS_KEY);
      
      if (!data) {
        console.log('No existing stats found in Redis, starting fresh');
        return;
      }

      this.stats.totalRequests = data.totalRequests || 0;
      this.stats.totalSuccess = data.totalSuccess || 0;
      this.stats.totalFailed = data.totalFailed || 0;
      this.stats.uniqueVisitors = new Set(data.uniqueVisitors || []);
      this.stats.startTime = data.startTime || Date.now();
      this.stats.endpoints = new Map();
      
      if (data.endpoints) {
        Object.entries(data.endpoints).forEach(([endpoint, stats]) => {
          this.stats.endpoints.set(endpoint, stats);
        });
      }

      this.stats.visitorsByDay = new Map();
      if (data.visitorsByDay) {
        Object.entries(data.visitorsByDay).forEach(([date, ips]) => {
          this.stats.visitorsByDay.set(date, new Set(ips));
        });
      }

      console.log(`Stats loaded from Redis: ${this.stats.totalRequests} total requests`);
    } catch (error) {
      console.error('Error loading stats from Redis:', error);
    }
  }

  private async saveStats(): Promise<void> {
    if (!this.redis) {
      return; 
    }

    try {
      const serialized: SerializedStats = {
        totalRequests: this.stats.totalRequests,
        totalSuccess: this.stats.totalSuccess,
        totalFailed: this.stats.totalFailed,
        uniqueVisitors: Array.from(this.stats.uniqueVisitors),
        startTime: this.stats.startTime,
        endpoints: {},
        visitorsByDay: {},
      };

      this.stats.endpoints.forEach((stats, endpoint) => {
        serialized.endpoints[endpoint] = stats;
      });

      this.stats.visitorsByDay.forEach((ips, date) => {
        serialized.visitorsByDay[date] = Array.from(ips);
      });

      await this.redis.set(this.REDIS_KEY, serialized);
      
      // We can use this for auto clean up
      // However, this will be considered later.
      // await this.redis.expire(this.REDIS_KEY, 90 * 24 * 60 * 60);
    } catch (error) {
      console.error('Error saving stats to Redis:', error);
    }
  }

  private scheduleSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
   
    this.saveTimeout = setTimeout(() => {
      this.saveStats();
    }, 5000);
  }

  trackRequest(endpoint: string, statusCode: number, clientIp: string): boolean {
    const now = Date.now();
    
    const isFailed = statusCode >= 500;
    
    if (isFailed) {
      const ipTracking = this.ipFailures.get(clientIp);
      
      if (!ipTracking) {
        this.ipFailures.set(clientIp, {
          count: 1,
          resetTime: now + this.FAIL_WINDOW_MS,
        });
      } else {
        if (now > ipTracking.resetTime) {
          ipTracking.count = 1;
          ipTracking.resetTime = now + this.FAIL_WINDOW_MS;
        } else {
          if (ipTracking.count >= this.MAX_FAILS_PER_IP) {
            return false;
          }
          ipTracking.count++;
        }
      }
    } else {
      const ipTracking = this.ipFailures.get(clientIp);
      if (ipTracking && ipTracking.count > 0) {
        ipTracking.count--;
      }
    }

    this.stats.totalRequests++;
    this.stats.uniqueVisitors.add(clientIp);

    const dateKey = new Date(now).toISOString().split('T')[0];
    if (!this.stats.visitorsByDay.has(dateKey)) {
      this.stats.visitorsByDay.set(dateKey, new Set());
    }
    this.stats.visitorsByDay.get(dateKey)!.add(clientIp);

    if (statusCode >= 200 && statusCode < 400) {
      this.stats.totalSuccess++;
    } else if (statusCode >= 500) {
      this.stats.totalFailed++;
    }

    if (!this.stats.endpoints.has(endpoint)) {
      this.stats.endpoints.set(endpoint, {
        totalRequests: 0,
        successRequests: 0,
        failedRequests: 0,
        lastAccessed: now,
      });
    }

    const endpointStats = this.stats.endpoints.get(endpoint)!;
    endpointStats.totalRequests++;
    endpointStats.lastAccessed = now;

    if (statusCode >= 200 && statusCode < 400) {
      endpointStats.successRequests++;
    } else if (statusCode >= 500) {
      endpointStats.failedRequests++;
    }

    this.scheduleSave();
    
    return true;
  }

  getGlobalStats() {
    const uptime = Date.now() - this.stats.startTime;
    const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
    const uptimeDays = Math.floor(uptimeHours / 24);

    return {
      totalRequests: this.stats.totalRequests,
      totalSuccess: this.stats.totalSuccess,
      totalFailed: this.stats.totalFailed,
      uniqueVisitors: this.stats.uniqueVisitors.size,
      successRate: this.stats.totalRequests > 0
        ? ((this.stats.totalSuccess / this.stats.totalRequests) * 100).toFixed(2)
        : "0.00",
      uptime: {
        ms: uptime,
        hours: uptimeHours,
        days: uptimeDays,
        formatted: uptimeDays > 0 
          ? `${uptimeDays}d ${uptimeHours % 24}h`
          : `${uptimeHours}h`,
      },
      persistenceEnabled: this.redis !== null,
    };
  }

  getVisitorChartData(days: number = 30): VisitorData[] {
    const now = new Date();
    const data: VisitorData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const visitors = this.stats.visitorsByDay.get(dateKey);
      const timestamp = date.getTime();
      
      data.push({
        timestamp,
        count: visitors ? visitors.size : 0,
      });
    }

    return data;
  }

  getEndpointStats(endpoint: string) {
    return this.stats.endpoints.get(endpoint) || null;
  }

  getAllEndpointStats() {
    const result: Record<string, EndpointStats> = {};
    this.stats.endpoints.forEach((stats, endpoint) => {
      result[endpoint] = stats;
    });
    return result;
  }
  
  getTopEndpoints(limit: number = 10) {
    return Array.from(this.stats.endpoints.entries())
      .map(([endpoint, stats]) => ({ endpoint, ...stats }))
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, limit);
  }

  async reset() {
    this.stats = {
      totalRequests: 0,
      totalSuccess: 0,
      totalFailed: 0,
      uniqueVisitors: new Set(),
      endpoints: new Map(),
      startTime: Date.now(),
      visitorsByDay: new Map(),
    };
    this.ipFailures.clear();
    await this.saveStats();
  }

  async shutdown(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    await this.saveStats();
    console.log('Stats saved on shutdown');
  }
}

let statsTracker: StatsTracker;

export async function initStatsTracker() {
  statsTracker = new StatsTracker();
  await statsTracker.loadStats();
  return statsTracker;
}

export function getStatsTracker() {
  if (!statsTracker) {
    throw new Error("StatsTracker not initialized. Call initStatsTracker() first.");
  }
  return statsTracker;
}