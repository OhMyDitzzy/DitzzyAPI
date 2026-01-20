import { Express, Router } from "express";
import { readdirSync, statSync, existsSync } from "fs";
import { join, extname, relative } from "path";
import { watch } from "chokidar";
import { pathToFileURL } from "url";
import { ApiPluginHandler, PluginMetadata, PluginRegistry } from "./types/plugin";

export class PluginLoader {
  private pluginRegistry: PluginRegistry = {};
  private pluginsDir: string;
  private router: Router | null = null;
  private app: Express | null = null;
  private watcher: any = null;

  constructor(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
  }

  async loadPlugins(app: Express, enableHotReload = false) {
    this.app = app;
    this.router = Router();

    await this.scanDirectory(this.pluginsDir, this.router);
    app.use("/api", this.router);

    console.log(`✅ Loaded ${Object.keys(this.pluginRegistry).length} plugins`);

    if (enableHotReload) {
      this.enableHotReload();
    }

    return this.pluginRegistry;
  }

  private enableHotReload() {
    if (this.watcher) {
      console.log("Hot reload already enabled");
      return;
    }

    console.log("🔥 Hot reload enabled for plugins");

    let reloadTimeout: NodeJS.Timeout | null = null;

    this.watcher = watch(this.pluginsDir, {
      ignored: /(^|[\/\\])\../, 
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100,
      },
    });

    const handleChange = (eventType: string, path: string) => {
      console.log(`📝 Plugin ${eventType}: ${relative(this.pluginsDir, path)}`);

      if (reloadTimeout) {
        clearTimeout(reloadTimeout);
      }

      reloadTimeout = setTimeout(() => {
        this.reloadPlugins();
      }, 200);
    };

    this.watcher
      .on("add", (path: string) => handleChange("added", path))
      .on("change", (path: string) => handleChange("changed", path))
      .on("unlink", (path: string) => {
        console.log(`🗑️ Plugin removed: ${relative(this.pluginsDir, path)}`);
        this.reloadPlugins();
      });
  }

  private async reloadPlugins() {
    if (!this.app || !this.router) return;

    try {
      console.log("🔄 Reloading plugins...");
      const oldRegistry = { ...this.pluginRegistry };
      const oldRouter = this.router;
      this.pluginRegistry = {};
      const newRouter = Router();
      this.clearModuleCache(this.pluginsDir);

      try {
        await this.scanDirectory(this.pluginsDir, newRouter);

        this.removeOldRouter();
        this.router = newRouter;
        this.app.use("/api", this.router);

        console.log(`✅ Successfully reloaded ${Object.keys(this.pluginRegistry).length} plugins`);
      } catch (scanError) {
        console.error("❌ Error scanning plugins, rolling back...");
        this.pluginRegistry = oldRegistry;
        this.router = oldRouter;
        throw scanError;
      }
    } catch (error) {
      console.error("❌ Error reloading plugins:", error);
      console.log("⚠️ Keeping previous plugin configuration");
    }
  }

  private removeOldRouter() {
    if (!this.app) return;

    try {
      const stack = (this.app as any)._router?.stack || [];

      for (let i = stack.length - 1; i >= 0; i--) {
        const layer = stack[i];
        if (layer.name === 'router' && layer.regexp.test('/api')) {
          stack.splice(i, 1);
        }
      }
    } catch (error) {
      console.warn("⚠️ Could not remove old router, continuing anyway...");
    }
  }

  private clearModuleCache(dirPath: string) {
    if (!existsSync(dirPath)) return;

    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        this.clearModuleCache(fullPath);
      } else if (stat.isFile() && (extname(item) === ".ts" || extname(item) === ".js")) {
        const relativePath = relative(process.cwd(), fullPath);
        console.log(`♻️ Marked for reload: ${relativePath}`);
      }
    }
  }

  private async scanDirectory(dir: string, router: Router, categoryPath: string[] = []) {
    try {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          await this.scanDirectory(fullPath, router, [...categoryPath, item]);
        } else if (stat.isFile() && (extname(item) === ".ts" || extname(item) === ".js")) {
          await this.loadPlugin(fullPath, router, categoryPath);
        }
      }
    } catch (error) {
      console.error(`❌ Error scanning directory ${dir}:`, error);
    }
  }

  private isValidPluginMetadata(handler: ApiPluginHandler, fileName: string): { valid: boolean; reason?: string } {
    if (!handler.category || !Array.isArray(handler.category) || handler.category.length === 0) {
      return { valid: false, reason: 'category is missing or empty' };
    }

    if (!handler.name || typeof handler.name !== 'string' || handler.name.trim() === '') {
      return { valid: false, reason: 'name is missing or empty' };
    }

    return { valid: true };
  }

  private async loadPlugin(filePath: string, router: Router, categoryPath: string[]) {
    const fileName = relative(this.pluginsDir, filePath);
    
    try {
      const fileUrl = pathToFileURL(filePath).href;
      const cacheBuster = `?update=${Date.now()}`;
      const module = await import(fileUrl + cacheBuster);

      const handler: ApiPluginHandler = module.default;

      if (!handler || !handler.exec) {
        console.warn(`⚠️ Skipping plugin '${fileName}': missing handler or exec function`);
        return;
      }

      if (!handler.method) {
        console.warn(`⚠️ Skipping plugin '${fileName}': missing 'method' field`);
        return;
      }

      if (!handler.alias || handler.alias.length === 0) {
        console.warn(`⚠️ Skipping plugin '${fileName}': missing 'alias' array`);
        return;
      }

      if (typeof handler.exec !== 'function') {
        console.warn(`⚠️ Skipping plugin '${fileName}': 'exec' must be a function`);
        return;
      }

      if (handler.disabled) {
        const reason = handler.disabledReason || "This plugin has been disabled";
        console.log(`🚫 Plugin '${handler.name}' is disabled: ${reason}`);
        // Still register it but with disabled flag
      }

      if (handler.deprecated) {
        const reason = handler.deprecatedReason || "This plugin is deprecated and may be removed in future versions";
        console.warn(`⚠️ Plugin '${handler.name}' is deprecated: ${reason}`);
      }

      const metadataValidation = this.isValidPluginMetadata(handler, fileName);
      const shouldShowInDocs = metadataValidation.valid;

      if (!shouldShowInDocs) {
        console.warn(`⚠️ Plugin '${fileName}' will be hidden from docs: ${metadataValidation.reason}`);
      }

      const basePath = handler.category && handler.category.length > 0 
        ? `/${handler.category.join("/")}` 
        : "";

      const primaryAlias = handler.alias[0];
      const primaryEndpoint = basePath ? `${basePath}/${primaryAlias}` : `/${primaryAlias}`;
      const method = handler.method.toLowerCase() as "get" | "post" | "put" | "delete" | "patch";

      // Wrap exec function to handle disabled/deprecated plugins
      const wrappedExec = async (req: any, res: any, next: any) => {
        // If plugin is disabled, return error response
        if (handler.disabled) {
          const reason = handler.disabledReason || "This plugin has been disabled";
          return res.status(403).json({
            success: false,
            message: "Plugin is disabled",
            reason: reason,
            plugin: handler.name || 'unknown',
          });
        }

        // If plugin is deprecated, add warning header
        if (handler.deprecated) {
          const reason = handler.deprecatedReason || "This plugin is deprecated and may be removed in future versions";
          res.setHeader('X-Plugin-Deprecated', 'true');
          res.setHeader('X-Deprecation-Reason', reason);
        }

        try {
          await handler.exec(req, res, next);
        } catch (error) {
          console.error(`❌ Error in plugin ${handler.name || 'unknown'}:`, error);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: "Plugin execution error",
              plugin: handler.name || 'unknown',
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
      };

      for (const alias of handler.alias) {
        const endpoint = basePath ? `${basePath}/${alias}` : `/${alias}`;
        router[method](endpoint, wrappedExec);
        
        const statusIcon = handler.disabled ? '🚫' : handler.deprecated ? '⚠️' : '✓';
        console.log(`${statusIcon} [${handler.method}] ${endpoint} -> ${handler.name || 'unnamed'}`);
      }

      if (shouldShowInDocs) {
        const metadata: PluginMetadata = {
          name: handler.name,
          description: handler.description,
          version: handler.version || "1.0.0",
          category: handler.category,
          method: handler.method,
          endpoint: primaryEndpoint,
          aliases: handler.alias,
          tags: handler.tags || [],
          parameters: handler.parameters || {
            query: [],
            body: [],
            headers: [],
            path: []
          },
          responses: handler.responses || {},
          disabled: handler.disabled,
          deprecated: handler.deprecated,
          disabledReason: handler.disabledReason,
          deprecatedReason: handler.deprecatedReason
        };

        this.pluginRegistry[primaryEndpoint] = { handler, metadata };
      }
    } catch (error) {
      console.error(`❌ Failed to load plugin '${fileName}':`, error instanceof Error ? error.message : error);
    }
  }

  getPluginMetadata(): PluginMetadata[] {
    return Object.values(this.pluginRegistry).map(p => p.metadata);
  }

  getPluginRegistry(): PluginRegistry {
    return this.pluginRegistry;
  }

  stopHotReload() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      console.log("🛑 Hot reload stopped");
    }
  }
}

let pluginLoader: PluginLoader;

export function initPluginLoader(pluginsDir: string) {
  pluginLoader = new PluginLoader(pluginsDir);
  return pluginLoader;
}

export function getPluginLoader() {
  return pluginLoader;
}