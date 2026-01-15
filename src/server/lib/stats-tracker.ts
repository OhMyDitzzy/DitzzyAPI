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
  visitorsByHour: Map<number, Set<string>>;
}

class StatsTracker {
  private stats: GlobalStats;
  private ipFailures: Map<string, IPFailureTracking>;
  private readonly MAX_FAILS_PER_IP = 1;
  private readonly FAIL_WINDOW_MS = 12 * 60 * 60 * 1000;

  constructor() {
    this.stats = {
      totalRequests: 0,
      totalSuccess: 0,
      totalFailed: 0,
      uniqueVisitors: new Set(),
      endpoints: new Map(),
      startTime: Date.now(),
      visitorsByHour: new Map(),
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

  trackRequest(endpoint: string, statusCode: number, clientIp: string): boolean {
    const now = Date.now();
    const isFailed = statusCode >= 400;
 
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

    const currentHour = Math.floor(now / (1000 * 60 * 60));
    if (!this.stats.visitorsByHour.has(currentHour)) {
      this.stats.visitorsByHour.set(currentHour, new Set());
    }
    this.stats.visitorsByHour.get(currentHour)!.add(clientIp);

    const cutoffHour = currentHour - 24;
    Array.from(this.stats.visitorsByHour.keys()).forEach(hour => {
      if (hour < cutoffHour) {
        this.stats.visitorsByHour.delete(hour);
      }
    });

    if (statusCode >= 200 && statusCode < 400) {
      this.stats.totalSuccess++;
    } else {
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
    } else {
      endpointStats.failedRequests++;
    }
    
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

  getVisitorChartData(): VisitorData[] {
    const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
    const data: VisitorData[] = [];

    for (let i = 23; i >= 0; i--) {
      const hour = currentHour - i;
      const visitors = this.stats.visitorsByHour.get(hour);
      const timestamp = hour * 1000 * 60 * 60;
      
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

  reset() {
    this.stats = {
      totalRequests: 0,
      totalSuccess: 0,
      totalFailed: 0,
      uniqueVisitors: new Set(),
      endpoints: new Map(),
      startTime: Date.now(),
      visitorsByHour: new Map(),
    };
    this.ipFailures.clear();
  }
}

let statsTracker: StatsTracker;

export function initStatsTracker() {
  statsTracker = new StatsTracker();
  return statsTracker;
}

export function getStatsTracker() {
  if (!statsTracker) {
    throw new Error("StatsTracker not initialized. Call initStatsTracker() first.");
  }
  return statsTracker;
}