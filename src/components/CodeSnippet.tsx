import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Prism from "prismjs"
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-python"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-json"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-markup"
import "prismjs/components/prism-css"

interface CodeSnippetProps {
  filename?: string
  language?: string
  code: string
  delay?: number
  className?: string
  showLineNumbers?: boolean
  copyable?: boolean
}

const LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  py: "python",
  python: "python",
  jsx: "jsx",
  tsx: "tsx",
  json: "json",
  bash: "bash",
  sh: "bash",
  html: "markup",
  css: "css",
  sql: "sql",
  go: "go",
  rust: "rust",
  java: "java",
};

export function CodeSnippet({
  filename = "example.js",
  language = "javascript",
  code,
  delay = 0.5,
  className = "",
  showLineNumbers = false,
  copyable = true,
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const prismLanguage = LANGUAGE_MAP[language.toLowerCase()] || language;

  useEffect(() => {
    // Highlight code whenever component mounts or code changes
    Prism.highlightAll();
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const displayLanguage = language.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      className={`group relative w-full max-w-3xl rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d1117]/80 backdrop-blur-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-gradient-to-r from-white/[0.03] to-white/[0.01]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="text-xs text-muted-foreground ml-2 font-mono truncate">
            {filename}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {copyable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 hover:bg-white/10 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span className="ml-1 text-xs">
                {copied ? "Copied!" : "Copy"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Code Area */}
      <div className="relative">
        <pre className={`font-mono text-sm leading-relaxed m-0 overflow-x-auto p-6 ${showLineNumbers ? 'line-numbers' : ''}`}>
          <code className={`language-${prismLanguage}`}>
            {code}
          </code>
        </pre>

        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0d1117] to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}
