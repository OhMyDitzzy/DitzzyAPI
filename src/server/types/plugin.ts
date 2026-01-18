import { Request, Response, NextFunction } from "express";

export interface FileConstraints {
  maxSize?: number; // NOTE: in bytes, e.g., 5 * 1024 * 1024 for 5MB
  acceptedTypes?: string[]; // NOTE: MIME types, e.g., ['image/jpeg', 'image/png']
  acceptedExtensions?: string[]; // e.g., ['.jpg', '.png', '.pdf']
}

export interface PluginParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "file";
  required: boolean;
  description: string;
  example?: any;
  default?: any;
  enum?: any[];
  pattern?: string;
  fileConstraints?: FileConstraints;
  acceptUrl?: boolean;
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
  version?: string;
  category: string[];
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  alias: string[];
  tags?: string[];
  parameters?: PluginParameters;
  responses?: {
    [statusCode: number]: PluginResponse;
  };
  disabled?: boolean;
  deprecated?: boolean;
  disabledReason?: string;
  deprecatedReason?: string;
  
  exec: (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
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
  disabled?: boolean;
  deprecated?: boolean;
  disabledReason?: string;
  deprecatedReason?: string;
}

export interface PluginRegistry {
  [endpoint: string]: {
    handler: ApiPluginHandler;
    metadata: PluginMetadata;
  };
}