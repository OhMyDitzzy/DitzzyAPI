import express, { type Request, Response, NextFunction } from "express";
import { serveStatic } from "./static";
import { createServer } from "http";
import { initPluginLoader, getPluginLoader } from "./plugin-loader";
import { join } from "path";
import { initStatsTracker, getStatsTracker } from "./lib/stats-tracker";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
    limit: '10mb'
  }),
);

app.use(express.urlencoded({ limit: '10mb', extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("id-ID", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};
const RATE_LIMIT = 25;
const WINDOW_MS = 60 * 1000;

setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  if (!rateLimitStore[clientIp]) {
    rateLimitStore[clientIp] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    return next();
  }

  const clientData = rateLimitStore[clientIp];

  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + WINDOW_MS;
    return next();
  }

  clientData.count++;

  const remaining = Math.max(0, RATE_LIMIT - clientData.count);
  const resetInSeconds = Math.ceil((clientData.resetTime - now) / 1000);

  res.setHeader("X-RateLimit-Limit", RATE_LIMIT.toString());
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", resetInSeconds.toString());

  if (clientData.count > RATE_LIMIT) {
    log(`Rate limit exceeded for IP: ${clientIp}`, "rate-limit");
    return res.status(429).json({
      message: "Too many requests, please try again later.",
      retryAfter: resetInSeconds,
    });
  }

  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse, null, 2)}`;
      }

      log(logLine);

      const excludedPaths = [
        '/api/plugins',
        '/api/stats',
        '/api/categories',
        '/docs'
      ];

      const isPluginEndpoint = !excludedPaths.some(excluded => path.startsWith(excluded));

      if (isPluginEndpoint) {
        const clientIp = req.ip || req.socket.remoteAddress || "unknown";
        const tracked = getStatsTracker().trackRequest(path, res.statusCode, clientIp);

        if (!tracked) {
          log(`Failed request from ${clientIp} not tracked (limit exceeded)`, "stats");
        }
      }
    }
  });

  next();
});

(async () => {
  const statsFilePath = join(process.cwd(), "stats-data.json");
  await initStatsTracker(statsFilePath);
  log("Stats tracker initialized with persistence");

  const pluginsDir = join(process.cwd(), "src/server/plugins");
  const pluginLoader = initPluginLoader(pluginsDir);

  const isDev = process.env.NODE_ENV === "development";
  await pluginLoader.loadPlugins(app, isDev);

  app.get("/api/plugins", (_req, res) => {
    const metadata = getPluginLoader().getPluginMetadata();
    res.json({
      success: true,
      count: metadata.length,
      plugins: metadata,
    });
  });

  app.get("/api/plugins/category/:category", (req, res) => {
    const { category } = req.params;
    const allPlugins = getPluginLoader().getPluginMetadata();
    const filtered = allPlugins.filter(p =>
      p.category.includes(category)
    );

    res.json({
      success: true,
      category,
      count: filtered.length,
      plugins: filtered,
    });
  });

  app.get("/api/stats", (_req, res) => {
    const globalStats = getStatsTracker().getGlobalStats();
    const topEndpoints = getStatsTracker().getTopEndpoints(5);

    res.json({
      success: true,
      stats: {
        global: globalStats,
        topEndpoints,
      },
    });
  });

  app.get("/api/stats/visitors", (req, res) => {
    const days = parseInt(req.query.days as string) || 30;
    const chartData = getStatsTracker().getVisitorChartData(days);

    res.json({
      success: true,
      data: chartData,
    });
  });

  app.get("/api/categories", (_req, res) => {
    const allPlugins = getPluginLoader().getPluginMetadata();
    const categoriesMap = new Map<string, number>();

    allPlugins.forEach(plugin => {
      plugin.category.forEach(cat => {
        categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
      });
    });

    const categories = Array.from(categoriesMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    res.json({
      success: true,
      categories,
    });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({
        message: "API endpoint not found",
        path: req.path,
      });
    }
    next();
  });

  const port = parseInt(process.env.PORT || "7860", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );

  process.on('SIGTERM', async () => {
    log('SIGTERM received, saving stats...', 'shutdown');
    await getStatsTracker().shutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    log('SIGINT received, saving stats...', 'shutdown');
    await getStatsTracker().shutdown();
    process.exit(0);
  });

  process.on('uncaughtException', async (error: Error) => {
    log(`Uncaught Exception: ${error.message}`, 'error');
    console.error(error.stack);
    await getStatsTracker().shutdown();
  });

  process.on('unhandledRejection', async (reason: any, promise: Promise<any>) => {
    log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'error');
    console.error(reason);
    await getStatsTracker().shutdown();
  });
})();