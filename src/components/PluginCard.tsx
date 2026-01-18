import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PluginMetadata } from "@/client/hooks/usePlugin";
import { Play, ChevronDown, ChevronUp, Copy, Check, AlertTriangle, XCircle } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { FileUpload } from "@/components/FileUpload";
import { getApiUrl } from "@/lib/api-url";

interface PluginCardProps {
  plugin: PluginMetadata;
}

const methodColors: Record<string, string> = {
  GET: "bg-green-500/20 text-green-400 border-green-500/50",
  POST: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  PUT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/50",
  PATCH: "bg-purple-500/20 text-purple-400 border-purple-500/50",
};

export function PluginCard({ plugin }: PluginCardProps) {
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [fileParams, setFileParams] = useState<Record<string, File | null>>({});
  const [urlParams, setUrlParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [requestUrl, setRequestUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedRequestUrl, setCopiedRequestUrl] = useState(false);

  const isDisabled = plugin.disabled;
  const isDeprecated = plugin.deprecated;

  const handleParamChange = (paramName: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [paramName]: value }));
  };

  const handleFileChange = (paramName: string, file: File | null) => {
    setFileParams((prev) => ({ ...prev, [paramName]: file }));
  };

  const handleUrlParamChange = (paramName: string, url: string) => {
    setUrlParams((prev) => ({ ...prev, [paramName]: url }));
  };
  
  const handleExecute = async () => {
    if (isDisabled) {
      setResponse({
        status: 503,
        statusText: "Service Unavailable",
        data: {
          success: false,
          message: "Plugin is disabled",
          reason: plugin.disabledReason || "This plugin has been disabled"
        }
      });
      return;
    }

    setLoading(true);

    try {
      let url = "/api" + plugin.endpoint;
      let fullUrl = getApiUrl(plugin.endpoint);

      // Check if we have any file parameters
      const hasFiles = Object.values(fileParams).some(file => file !== null);
      const hasUrls = Object.values(urlParams).some(url => url !== "");

      if (plugin.method === "GET" && plugin.parameters?.query) {
        const queryParams = new URLSearchParams();
        plugin.parameters.query.forEach((param) => {
          if (param.type === "file" && param.acceptUrl) {
            const urlValue = urlParams[param.name];
            if (urlValue) {
              queryParams.append(param.name, urlValue);
            }
          } else {
            const value = paramValues[param.name];
            if (value) {
              queryParams.append(param.name, value);
            }
          }
        });

        if (queryParams.toString()) {
          url += "?" + queryParams.toString();
          fullUrl += "?" + queryParams.toString();
        }
      }

      setRequestUrl(fullUrl);

      const fetchOptions: RequestInit = {
        method: plugin.method,
      };

      if (hasFiles || (hasUrls && plugin.method !== "GET")) {
        const formData = new FormData();

        Object.entries(fileParams).forEach(([name, file]) => {
          if (file) {
            formData.append(name, file);
          }
        });

        Object.entries(urlParams).forEach(([name, url]) => {
          if (url && !fileParams[name]) {
            formData.append(name, url);
          }
        });

        if (plugin.parameters?.body) {
          plugin.parameters.body.forEach((param) => {
            if (param.type !== "file") {
              const value = paramValues[param.name];
              if (value) {
                formData.append(param.name, value);
              }
            }
          });
        }

        fetchOptions.body = formData;
      } else if (["POST", "PUT", "PATCH"].includes(plugin.method) && plugin.parameters?.body) {
        const bodyData: Record<string, any> = {};
        plugin.parameters.body.forEach((param) => {
          const value = paramValues[param.name];
          if (value) {
            bodyData[param.name] = value;
          }
        });
        fetchOptions.body = JSON.stringify(bodyData);
        fetchOptions.headers = {
          "Content-Type": "application/json",
        };
      }

      // Add XMLHttpRequest fallback for FormData to avoid HTTP/2 issues
      let res;
      let data;
      
      if (fetchOptions.body instanceof FormData) {
        // Use XMLHttpRequest for FormData to ensure compatibility
        const xhr = new XMLHttpRequest();
        
        const xhrPromise = new Promise((resolve, reject) => {
          xhr.onload = () => {
            try {
              const responseData = JSON.parse(xhr.responseText);
              resolve({
                status: xhr.status,
                statusText: xhr.statusText,
                headers: new Headers(),
                json: async () => responseData
              });
            } catch (e) {
              reject(new Error('Failed to parse response'));
            }
          };
          
          xhr.onerror = () => reject(new Error('Network request failed'));
          xhr.ontimeout = () => reject(new Error('Request timeout'));
          
          xhr.open(plugin.method, url, true);
          xhr.timeout = 60000; // 60 second timeout
          xhr.send(fetchOptions.body as FormData);
        });
        
        res = await xhrPromise as any;
        data = await res.json();
      } else {
        // Use fetch for non-FormData requests
        res = await fetch(url, fetchOptions);
        data = await res.json();
      }

      const headers: Record<string, string> = {};
      
      // Get headers from Response object
      if (res.headers && typeof res.headers.forEach === 'function') {
        res.headers.forEach((value: string, key: string) => {
          headers[key] = value;
        });
      }

      setResponseHeaders(headers);
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });
    } catch (error) {
      setResponse({
        status: 500,
        statusText: "Error",
        data: { error: error instanceof Error ? error.message : "Unknown error" },
      });
      setResponseHeaders({});
    } finally {
      setLoading(false);
    }
  };

  const copyApiUrl = () => {
    const fullUrl = getApiUrl(plugin.endpoint);
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyRequestUrl = () => {
    navigator.clipboard.writeText(requestUrl);
    setCopiedRequestUrl(true);
    setTimeout(() => setCopiedRequestUrl(false), 2000);
  };

  const renderParameterInput = (param: any) => {
    if (param.type === "file") {
      return (
        <FileUpload
          name={param.name}
          description={param.description}
          fileConstraints={param.fileConstraints}
          acceptUrl={param.acceptUrl}
          onFileChange={(file) => handleFileChange(param.name, file)}
          onUrlChange={param.acceptUrl ? (url) => handleUrlParamChange(param.name, url) : undefined}
          disabled={isDisabled}
        />
      );
    }

    if (param.enum && Array.isArray(param.enum) && param.enum.length > 0) {
      return (
        <Select
          value={paramValues[param.name] || ""}
          onValueChange={(value) => handleParamChange(param.name, value)}
          disabled={isDisabled}
        >
          <SelectTrigger className="bg-black/50 border-white/10 text-white focus:border-purple-500 disabled:opacity-50">
            <SelectValue placeholder={`Select ${param.name}...`} />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            {param.enum.map((option: any) => (
              <SelectItem 
                key={option} 
                value={option.toString()}
                className="text-white hover:bg-white/10 focus:bg-white/10"
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type="text"
        placeholder={param.example?.toString() || param.description}
        value={paramValues[param.name] || ""}
        onChange={(e) => handleParamChange(param.name, e.target.value)}
        disabled={isDisabled}
        className="bg-black/50 border-white/10 text-white focus:border-purple-500 disabled:opacity-50"
      />
    );
  };

  const hasQueryParams = plugin.parameters?.query && plugin.parameters.query.length > 0;
  const hasBodyParams = plugin.parameters?.body && plugin.parameters.body.length > 0;
  const hasPathParams = plugin.parameters?.path && plugin.parameters.path.length > 0;
  const hasAnyParams = hasQueryParams || hasBodyParams || hasPathParams;

  const generateCurlExample = () => {
    let curl = `curl -X ${plugin.method} "${getApiUrl(plugin.endpoint)}`;

    if (hasQueryParams) {
      const exampleParams = plugin.parameters!.query!
        .map((p) => {
          if (p.type === "file" && p.acceptUrl) {
            return `${p.name}=https://example.com/file.jpg`;
          }
          return `${p.name}=${p.example || 'value'}`;
        })
        .join('&');
      curl += `?${exampleParams}`;
    }

    curl += '"';

    if (hasBodyParams) {
      const hasFileParams = plugin.parameters!.body!.some(p => p.type === "file");
      
      if (hasFileParams) {
        curl += ' \\\n';
        plugin.parameters!.body!.forEach((p) => {
          if (p.type === "file") {
            if (p.acceptUrl) {
              curl += `  -F "${p.name}=https://example.com/file.jpg" \\\n`;
            } else {
              curl += `  -F "${p.name}=@/path/to/file" \\\n`;
            }
          } else {
            curl += `  -F "${p.name}=${p.example || 'value'}" \\\n`;
          }
        });
        curl = curl.slice(0, -3); // Remove last \\\n
      } else {
        curl += ' \\\n  -H "Content-Type: application/json" \\\n  -d \'';
        const bodyExample: Record<string, any> = {};
        plugin.parameters!.body!.forEach((p) => {
          bodyExample[p.name] = p.example || 'value';
        });
        curl += JSON.stringify(bodyExample, null, 2);
        curl += "'";
      }
    }

    return curl;
  };

  const generateNodeExample = () => {
    const hasFileParams = plugin.parameters?.body?.some(p => p.type === "file") || false;

    if (hasFileParams) {
      let code = 'const formData = new FormData();\n';
      
      plugin.parameters!.body!.forEach((p) => {
        if (p.type === "file") {
          if (p.acceptUrl) {
            code += `formData.append("${p.name}", "https://example.com/file.jpg");\n`;
          } else {
            code += `// For file upload from input: <input type="file" id="fileInput">\n`;
            code += `const fileInput = document.getElementById("fileInput");\n`;
            code += `formData.append("${p.name}", fileInput.files[0]);\n`;
          }
        } else {
          code += `formData.append("${p.name}", "${p.example || 'value'}");\n`;
        }
      });

      code += `\nconst response = await fetch("${getApiUrl(plugin.endpoint)}", {\n`;
      code += `  method: "${plugin.method}",\n`;
      code += `  body: formData\n`;
      code += '});\n\nconst data = await response.json();\nconsole.log(data);';
      return code;
    }

    let code = `const response = await fetch("${getApiUrl(plugin.endpoint)}`;

    if (hasQueryParams) {
      const exampleParams = plugin.parameters!.query!
        .map((p) => {
          if (p.type === "file" && p.acceptUrl) {
            return `${p.name}=https://example.com/file.jpg`;
          }
          return `${p.name}=${p.example || 'value'}`;
        })
        .join('&');
      code += `?${exampleParams}`;
    }

    code += '", {\n  method: "' + plugin.method + '"';

    if (hasBodyParams && !hasFileParams) {
      code += ',\n  headers: {\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify(';
      const bodyExample: Record<string, any> = {};
      plugin.parameters!.body!.forEach((p) => {
        bodyExample[p.name] = p.example || 'value';
      });
      code += JSON.stringify(bodyExample, null, 2);
      code += ')';
    }

    code += '\n});\n\nconst data = await response.json();\nconsole.log(data);';
    return code;
  };

  return (
    <Card className={`bg-white/[0.02] border-white/10 overflow-hidden w-full ${isDisabled ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div
        className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge className={`${methodColors[plugin.method]} border font-bold px-3 py-1 flex-shrink-0`}>
            {plugin.method}
          </Badge>
          <code className="text-sm text-purple-400 font-mono flex-1 min-w-0 break-all">{plugin.endpoint}</code>
          
          {isDisabled && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/50 border flex items-center gap-1 flex-shrink-0">
              <XCircle className="w-3 h-3" />
              Disabled
            </Badge>
          )}
          {isDeprecated && !isDisabled && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 border flex items-center gap-1 flex-shrink-0">
              <AlertTriangle className="w-3 h-3" />
              Deprecated
            </Badge>
          )}

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyApiUrl();
              }}
              className="text-gray-400 hover:text-white transition-colors p-1.5"
              title="Copy API URL"
            >
              {copiedUrl ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              className="text-gray-400 hover:text-white transition-colors p-1.5"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="w-full">
          <h3 className="text-xl font-bold text-white mb-2">{plugin.name}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{plugin.description || "No description provided"}</p>

          {isDisabled && plugin.disabledReason && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400">Plugin Disabled</p>
                <p className="text-xs text-red-300 mt-1">{plugin.disabledReason}</p>
              </div>
            </div>
          )}

          {isDeprecated && !isDisabled && plugin.deprecatedReason && (
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">Plugin Deprecated</p>
                <p className="text-xs text-yellow-300 mt-1">{plugin.deprecatedReason}</p>
              </div>
            </div>
          )}

          {plugin.tags && plugin.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {plugin.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="bg-white/5 text-gray-400 border-white/10 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-start gap-2">
            <span className="text-xs text-gray-500 flex-shrink-0">API URL:</span>
            <code className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded break-all flex-1">
              {getApiUrl(plugin.endpoint)}
            </code>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <Tabs defaultValue="try" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-white/10 bg-transparent p-0">
            <TabsTrigger
              value="documentation"
              className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-400 px-6 py-3"
            >
              Documentation
            </TabsTrigger>
            <TabsTrigger
              value="try"
              className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-400 px-6 py-3"
            >
              Try It Out
            </TabsTrigger>
          </TabsList>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="p-6 space-y-6">
            {hasAnyParams && (
              <div>
                <h4 className="text-purple-400 font-semibold mb-3">Parameters</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-gray-400 font-medium pb-2 pr-4">Name</th>
                        <th className="text-left text-gray-400 font-medium pb-2 pr-4">Type</th>
                        <th className="text-left text-gray-400 font-medium pb-2 pr-4">Required</th>
                        <th className="text-left text-gray-400 font-medium pb-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...(plugin.parameters?.path || []), ...(plugin.parameters?.query || []), ...(plugin.parameters?.body || [])].map((param) => (
                        <tr key={param.name} className="border-b border-white/5">
                          <td className="py-3 pr-4 text-white font-mono">{param.name}</td>
                          <td className="py-3 pr-4">
                            <span className="text-blue-400 font-mono text-xs">{param.type}</span>
                            {param.type === "file" && param.fileConstraints && (
                              <div className="mt-1 space-y-1">
                                {param.fileConstraints.maxSize && (
                                  <div className="text-xs text-gray-500">
                                    Max: {(param.fileConstraints.maxSize / 1024 / 1024).toFixed(1)}MB
                                  </div>
                                )}
                                {param.fileConstraints.acceptedTypes && (
                                  <div className="text-xs text-gray-500">
                                    Types: {param.fileConstraints.acceptedTypes.join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                            {param.enum && (
                              <span className="ml-2 text-xs text-gray-500">
                                (options: {param.enum.join(', ')})
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={param.required ? "text-red-400" : "text-gray-500"}>
                              {param.required ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400">
                            {param.description}
                            {param.type === "file" && param.acceptUrl && (
                              <span className="block mt-1 text-xs text-purple-400">
                                ✓ Can also accept URL
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Responses section */}
            {plugin.responses && Object.keys(plugin.responses).length > 0 && (
              <div>
                <h4 className="text-purple-400 font-semibold mb-3">Responses</h4>
                <div className="space-y-3">
                  {Object.entries(plugin.responses).map(([status, response]) => (
                    <div key={status} className="border border-white/10 rounded-lg overflow-hidden">
                      <div className={`px-4 py-2 flex items-center gap-3 ${parseInt(status) >= 200 && parseInt(status) < 300
                        ? "bg-green-500/10"
                        : parseInt(status) >= 400 && parseInt(status) < 500
                          ? "bg-yellow-500/10"
                          : "bg-red-500/10"
                        }`}>
                        <Badge
                          className={`${parseInt(status) >= 200 && parseInt(status) < 300
                            ? "bg-green-500/20 text-green-400 border-green-500/50"
                            : parseInt(status) >= 400 && parseInt(status) < 500
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                              : "bg-red-500/20 text-red-400 border-red-500/50"
                            } border font-bold`}
                        >
                          {status}
                        </Badge>
                        <span className="text-sm text-white">{response.description}</span>
                      </div>
                      <pre className="p-4 bg-black/50 text-xs overflow-x-auto">
                        <code className="text-gray-300">{JSON.stringify(response.example, null, 2)}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Code Examples */}
            <div>
              <h4 className="text-purple-400 font-semibold mb-3">Code Example</h4>
              <div className="space-y-3">
                <div>
                  <div className="mb-2">
                    <span className="text-xs text-gray-400">cURL</span>
                  </div>
                  <CodeBlock code={generateCurlExample()} language="bash" />
                </div>

                <div>
                  <div className="mb-2">
                    <span className="text-xs text-gray-400">Node.js (fetch)</span>
                  </div>
                  <CodeBlock code={generateNodeExample()} language="javascript" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Try It Out Tab */}
          <TabsContent value="try" className="p-6">
            {hasAnyParams ? (
              <div className="space-y-4 mb-4">
                {[...(plugin.parameters?.query || []), ...(plugin.parameters?.body || [])].map((param) => (
                  <div key={param.name}>
                    {param.type !== "file" && (
                      <>
                        <label className="block text-sm text-gray-300 mb-2">
                          {param.name}
                          {param.required && <span className="text-red-400 ml-1">*</span>}
                          <span className="text-xs text-gray-500 ml-2">({param.type})</span>
                          {param.enum && (
                            <span className="text-xs text-purple-400 ml-2">
                              • Select from options
                            </span>
                          )}
                        </label>
                        {renderParameterInput(param)}
                        <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                      </>
                    )}
                    {param.type === "file" && renderParameterInput(param)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-4">No parameters required</p>
            )}

            <Button
              onClick={handleExecute}
              disabled={loading || isDisabled}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5 mr-2" />
              {loading ? "Executing..." : isDisabled ? "Plugin Disabled" : "Execute"}
            </Button>

            {/* Response Display */}
            {response && (
              <div className="mt-6 space-y-4">
                {isDeprecated && responseHeaders['x-plugin-deprecated'] && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-400">Deprecation Warning</p>
                      <p className="text-xs text-yellow-300 mt-1">
                        {responseHeaders['x-deprecation-reason'] || 'This plugin is deprecated'}
                      </p>
                    </div>
                  </div>
                )}

                {requestUrl && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Request URL</span>
                      <button
                        onClick={copyRequestUrl}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                        title="Copy Request URL"
                      >
                        {copiedRequestUrl ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="bg-black/50 border border-white/10 rounded p-3 overflow-x-auto">
                      <code className="text-xs text-purple-300 break-all">{requestUrl}</code>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Response Status</span>
                  <Badge className={`${response.status >= 200 && response.status < 300
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                    }`}>
                    {response.status} {response.statusText}
                  </Badge>
                </div>

                {Object.keys(responseHeaders).length > 0 && (
                  <div>
                    <h5 className="text-sm text-gray-400 mb-2">Response Headers</h5>
                    <div className="bg-black/50 border border-white/10 rounded p-4 space-y-1 overflow-x-auto">
                      {Object.entries(responseHeaders).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="text-purple-400">{key}:</span>{" "}
                          <span className="text-gray-300">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="text-sm text-gray-400 mb-2">Response Body</h5>
                  <CodeBlock
                    code={JSON.stringify(response.data, null, 2)}
                    language="json"
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
}