import { promises as fs } from 'fs';
import { join } from 'path';

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

interface DailyVisitors {
  [date: string]: Set<string>;
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
  private readonly STATS_FILE_PATH: string;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor(statsFilePath?: string) {
    this.STATS_FILE_PATH = statsFilePath || join(process.cwd(), 'stats-data.json');
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
    try {
      const data = await fs.readFile(this.STATS_FILE_PATH, 'utf-8');
      const parsed: SerializedStats = JSON.parse(data);

      this.stats.totalRequests = parsed.totalRequests || 0;
      this.stats.totalSuccess = parsed.totalSuccess || 0;
      this.stats.totalFailed = parsed.totalFailed || 0;
      this.stats.uniqueVisitors = new Set(parsed.uniqueVisitors || []);
      this.stats.startTime = parsed.startTime || Date.now();
      this.stats.endpoints = new Map();
      
      if (parsed.endpoints) {
        Object.entries(parsed.endpoints).forEach(([endpoint, stats]) => {
          this.stats.endpoints.set(endpoint, stats);
        });
      }

      this.stats.visitorsByDay = new Map();
      if (parsed.visitorsByDay) {
        Object.entries(parsed.visitorsByDay).forEach(([date, ips]) => {
          this.stats.visitorsByDay.set(date, new Set(ips));
        });
      }

      console.log('Stats loaded successfully from', this.STATS_FILE_PATH);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('No existing stats file found, starting fresh');
      } else {
        console.error('Error loading stats:', error);
      }
    }
  }

  private async saveStats(): Promise<void> {
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

      await fs.writeFile(
        this.STATS_FILE_PATH,
        JSON.stringify(serialized, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error saving stats:', error);
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
  }
}

let statsTracker: StatsTracker;

export async function initStatsTracker(statsFilePath?: string) {
  statsTracker = new StatsTracker(statsFilePath);
  await statsTracker.loadStats();
  return statsTracker;
}

export function getStatsTracker() {
  if (!statsTracker) {
    throw new Error("StatsTracker not initialized. Call initStatsTracker() first.");
  }
  return statsTracker;
}