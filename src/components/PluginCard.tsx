import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PluginMetadata } from "@/client/hooks/usePlugin";
import { Play, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
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
  const [response, setResponse] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [requestUrl, setRequestUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedRequestUrl, setCopiedRequestUrl] = useState(false);

  const handleParamChange = (paramName: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [paramName]: value }));
  };

  const handleExecute = async () => {
    setLoading(true);
    
    try {
      let url = "/api" + plugin.endpoint;
      let fullUrl = getApiUrl(plugin.endpoint);

      if (plugin.method === "GET" && plugin.parameters?.query) {
        const queryParams = new URLSearchParams();
        plugin.parameters.query.forEach((param) => {
          const value = paramValues[param.name];
          if (value) {
            queryParams.append(param.name, value);
          }
        });

        if (queryParams.toString()) {
          url += "?" + queryParams.toString();
          fullUrl += "?" + queryParams.toString();
        }
      }

      // Store the request URL for display
      setRequestUrl(fullUrl);

      const fetchOptions: RequestInit = {
        method: plugin.method,
      };

      // Add body for POST/PUT/PATCH
      if (["POST", "PUT", "PATCH"].includes(plugin.method) && plugin.parameters?.body) {
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

      const res = await fetch(url, fetchOptions);
      const data = await res.json();

      // Capture response headers
      const headers: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        headers[key] = value;
      });

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
  
  const hasQueryParams = plugin.parameters?.query && plugin.parameters.query.length > 0;
  const hasBodyParams = plugin.parameters?.body && plugin.parameters.body.length > 0;
  const hasPathParams = plugin.parameters?.path && plugin.parameters.path.length > 0;
  const hasAnyParams = hasQueryParams || hasBodyParams || hasPathParams;
  
  const generateCurlExample = () => {
    let curl = `curl -X ${plugin.method} "${getApiUrl(plugin.endpoint)}`;
    
    if (hasQueryParams) {
      const exampleParams = plugin.parameters!.query!
        .map((p) => `${p.name}=${p.example || 'value'}`)
        .join('&');
      curl += `?${exampleParams}`;
    }
    
    curl += '"';
    
    if (hasBodyParams) {
      curl += ' \\\n  -H "Content-Type: application/json" \\\n  -d \'';
      const bodyExample: Record<string, any> = {};
      plugin.parameters!.body!.forEach((p) => {
        bodyExample[p.name] = p.example || 'value';
      });
      curl += JSON.stringify(bodyExample, null, 2);
      curl += "'";
    }
    
    return curl;
  };

  const generateNodeExample = () => {
    let code = `const response = await fetch("${getApiUrl(plugin.endpoint)}`;
    
    if (hasQueryParams) {
      const exampleParams = plugin.parameters!.query!
        .map((p) => `${p.name}=${p.example || 'value'}`)
        .join('&');
      code += `?${exampleParams}`;
    }
    
    code += '", {\n  method: "' + plugin.method + '"';
    
    if (hasBodyParams) {
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
    <Card className="bg-white/[0.02] border-white/10 overflow-hidden">
      {/* Collapsible Header */}
      <div 
        className="p-6 border-b border-white/10 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Badge className={`${methodColors[plugin.method]} border font-bold px-3 py-1 flex-shrink-0`}>
                {plugin.method}
              </Badge>
              <code className="text-sm text-purple-400 font-mono break-all">{plugin.endpoint}</code>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyApiUrl();
                }}
                className="text-gray-400 hover:text-white transition-colors p-1 flex-shrink-0"
                title="Copy API URL"
              >
                {copiedUrl ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 break-words">{plugin.name}</h3>
            <p className="text-gray-400 text-sm break-words">{plugin.description}</p>
            
            {/* Tags */}
            {plugin.tags && plugin.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {plugin.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-white/5 text-gray-400 border-white/10 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* API URL Display */}
            <div className="mt-3 flex items-start gap-2">
              <span className="text-xs text-gray-500 flex-shrink-0">API URL:</span>
              <code className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded break-all">
                {getApiUrl(plugin.endpoint)}
              </code>
            </div>
          </div>

          <button 
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-2 hover:bg-white/5 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <ChevronDown className="w-6 h-6" />
            )}
          </button>
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
            {/* Parameters Table */}
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
                      {/* Path Parameters */}
                      {plugin.parameters?.path?.map((param) => (
                        <tr key={param.name} className="border-b border-white/5">
                          <td className="py-3 pr-4 text-white font-mono">{param.name}</td>
                          <td className="py-3 pr-4 text-blue-400 font-mono text-xs">{param.type}</td>
                          <td className="py-3 pr-4">
                            <span className={param.required ? "text-red-400" : "text-gray-500"}>
                              {param.required ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400">{param.description}</td>
                        </tr>
                      ))}
                      {/* Query Parameters */}
                      {plugin.parameters?.query?.map((param) => (
                        <tr key={param.name} className="border-b border-white/5">
                          <td className="py-3 pr-4 text-white font-mono">{param.name}</td>
                          <td className="py-3 pr-4 text-blue-400 font-mono text-xs">{param.type}</td>
                          <td className="py-3 pr-4">
                            <span className={param.required ? "text-red-400" : "text-gray-500"}>
                              {param.required ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400">{param.description}</td>
                        </tr>
                      ))}
                      {/* Body Parameters */}
                      {plugin.parameters?.body?.map((param) => (
                        <tr key={param.name} className="border-b border-white/5">
                          <td className="py-3 pr-4 text-white font-mono">{param.name}</td>
                          <td className="py-3 pr-4 text-blue-400 font-mono text-xs">{param.type}</td>
                          <td className="py-3 pr-4">
                            <span className={param.required ? "text-red-400" : "text-gray-500"}>
                              {param.required ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400">{param.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Responses */}
            {plugin.responses && Object.keys(plugin.responses).length > 0 && (
              <div>
                <h4 className="text-purple-400 font-semibold mb-3">Responses</h4>
                <div className="space-y-3">
                  {Object.entries(plugin.responses).map(([status, response]) => (
                    <div key={status} className="border border-white/10 rounded-lg overflow-hidden">
                      <div className={`px-4 py-2 flex items-center gap-3 ${
                        parseInt(status) >= 200 && parseInt(status) < 300
                          ? "bg-green-500/10"
                          : parseInt(status) >= 400 && parseInt(status) < 500
                          ? "bg-yellow-500/10"
                          : "bg-red-500/10"
                      }`}>
                        <Badge
                          className={`${
                            parseInt(status) >= 200 && parseInt(status) < 300
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
            {/* Parameters Input */}
            {hasAnyParams ? (
              <div className="space-y-4 mb-4">
                {/* Query Parameters */}
                {plugin.parameters?.query?.map((param) => (
                  <div key={param.name}>
                    <label className="block text-sm text-gray-300 mb-2">
                      {param.name}
                      {param.required && <span className="text-red-400 ml-1">*</span>}
                      <span className="text-xs text-gray-500 ml-2">({param.type})</span>
                    </label>
                    <Input
                      type="text"
                      placeholder={param.example?.toString() || param.description}
                      value={paramValues[param.name] || ""}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      className="bg-black/50 border-white/10 text-white focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                  </div>
                ))}
                
                {/* Body Parameters */}
                {plugin.parameters?.body?.map((param) => (
                  <div key={param.name}>
                    <label className="block text-sm text-gray-300 mb-2">
                      {param.name}
                      {param.required && <span className="text-red-400 ml-1">*</span>}
                      <span className="text-xs text-gray-500 ml-2">({param.type})</span>
                    </label>
                    <Input
                      type="text"
                      placeholder={param.example?.toString() || param.description}
                      value={paramValues[param.name] || ""}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      className="bg-black/50 border-white/10 text-white focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-4">No parameters required</p>
            )}

            {/* Execute Button */}
            <Button
              onClick={handleExecute}
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 text-base font-semibold"
            >
              <Play className="w-5 h-5 mr-2" />
              {loading ? "Executing..." : "Execute"}
            </Button>

            {/* Response Display */}
            {response && (
              <div className="mt-6 space-y-4">
                {/* Request URL */}
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

                {/* Response Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Response Status</span>
                  <Badge className={`${
                    response.status >= 200 && response.status < 300
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {response.status} {response.statusText}
                  </Badge>
                </div>

                {/* Response Headers */}
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

                {/* Response Body with Syntax Highlighting */}
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