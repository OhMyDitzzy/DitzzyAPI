import React, { Component, ReactNode } from "react";
import { Button } from "./ui/button";
import { AlertTriangle, RefreshCw, Home, Code } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
          <div className="max-w-3xl w-full">
            {/* Main Error Card */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 border-b border-white/10 p-8">
                <div className="flex items-start gap-4">
                  {/* Animated Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30 backdrop-blur-sm animate-pulse">
                      <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                      Oops! Something went wrong
                    </h1>
                    <p className="text-gray-400 text-base">
                      Don't worry, your data is safe. The error has been logged and we'll look into it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              <div className="p-8 space-y-6">
                {this.state.error && (
                  <div className="space-y-4">
                    {/* Error Message */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Error Message
                      </h3>
                      <div className="bg-black/50 border border-red-500/30 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-red-300 whitespace-pre-wrap break-words">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                    </div>

                    {/* Stack Trace (Dev Only) */}
                    {import.meta.env.DEV && this.state.errorInfo && (
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-semibold text-gray-400 hover:text-gray-300 transition-colors select-none flex items-center gap-2 mb-2">
                          <svg 
                            className="w-4 h-4 transition-transform group-open:rotate-90" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          Stack Trace (Development Mode)
                        </summary>
                        <div className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button 
                    onClick={this.handleReset} 
                    className="bg-purple-500 hover:bg-purple-600 text-white gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="border-white/10 text-gray-300 hover:bg-white/5 gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Page
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/")}
                    variant="outline"
                    className="border-white/10 text-gray-300 hover:bg-white/5 gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Go Home
                  </Button>
                </div>

                {/* Help Text */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-500">
                    If this problem persists, please contact support or check the console for more details.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Help Card */}
            <div className="mt-6 bg-white/[0.02] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-3">Quick Troubleshooting</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Try clearing your browser cache and cookies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Check your internet connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Make sure you're using a supported browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Disable browser extensions that might interfere</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}