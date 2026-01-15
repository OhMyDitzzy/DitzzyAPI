import { Request, Response, NextFunction } from "express";

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

export interface ApiPluginHandler {
  name: string;
  description: string;
  version: string;
  category: string[];
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  alias: string[];
  tags?: string[]; 
  parameters?: PluginParameters;
  responses?: {
    [statusCode: number]: PluginResponse;
  };

  exec: (req: Request, res: Response, next: NextFunction) => Promise<any> | any;
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

export interface PluginRegistry {
  [endpoint: string]: {
    handler: ApiPluginHandler;
    metadata: PluginMetadata;
  };
}

export interface ApiResponse<T = any> {
  status: number;
  message?: string;
  author?: string;
  note?: string;
  results?: T;
  error?: string;
}