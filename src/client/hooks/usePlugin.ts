import { useState, useEffect } from "react";

export interface PluginParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  description: string;
  example?: any;
  default?: any;
  enum?: any[];
  pattern?: string;
}

export interface PluginResponse {
  status: number;
  description: string;
  example: any;
}

export interface PluginParameters {
  query?: PluginParameter[];
  body?: PluginParameter[];
  headers?: PluginParameter[];
  path?: PluginParameter[];
}

export interface PluginMetadata {
  name: string;
  description: string;
  version: string;
  category: string[];
  method: string;
  endpoint: string;
  aliases: string[];
  tags?: string[];
  parameters?: PluginParameters;
  responses?: {
    [statusCode: number]: PluginResponse;
  };
}

export interface ApiStats {
  totalRequests: number;
  totalSuccess: number;
  totalFailed: number;
  uniqueVisitors: number;
  successRate: string;
  uptime: {
    ms: number;
    hours: number;
    days: number;
    formatted: string;
  };
}

export interface Category {
  name: string;
  count: number;
}

export function usePlugins() {
  const [plugins, setPlugins] = useState<PluginMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/plugins");
      const data = await response.json();
      
      if (data.success) {
        setPlugins(data.plugins);
      } else {
        setError("Failed to load plugins");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { plugins, loading, error, refetch: fetchPlugins };
}

export function useStats() {
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stats");
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats.global);
      } else {
        setError("Failed to load stats");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: fetchStats };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
      } else {
        setError("Failed to load categories");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, refetch: fetchCategories };
}

export function usePluginsByCategory(category: string | null) {
  const [plugins, setPlugins] = useState<PluginMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) {
      fetchAllPlugins();
    } else {
      fetchPluginsByCategory(category);
    }
  }, [category]);

  const fetchAllPlugins = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/plugins");
      const data = await response.json();
      
      if (data.success) {
        setPlugins(data.plugins);
      } else {
        setError("Failed to load plugins");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPluginsByCategory = async (cat: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/plugins/category/${cat}`);
      const data = await response.json();
      
      if (data.success) {
        setPlugins(data.plugins);
      } else {
        setError("Failed to load plugins");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { plugins, loading, error };
}