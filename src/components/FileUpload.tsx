import { useState, useRef, useCallback } from "react";
import { Upload, X, File, AlertCircle, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileConstraints } from "@/server/types/plugin";

interface FileUploadProps {
  name: string;
  description: string;
  fileConstraints?: FileConstraints;
  acceptUrl?: boolean;
  onFileChange: (file: File | null) => void;
  onUrlChange?: (url: string) => void;
  disabled?: boolean;
}

export function FileUpload({
  name,
  description,
  fileConstraints,
  acceptUrl = false,
  onFileChange,
  onUrlChange,
  disabled = false,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!fileConstraints) return null;
    
    if (fileConstraints.maxSize && file.size > fileConstraints.maxSize) {
      return `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(fileConstraints.maxSize)})`;
    }

    if (fileConstraints.acceptedTypes && fileConstraints.acceptedTypes.length > 0) {
      if (!fileConstraints.acceptedTypes.includes(file.type)) {
        return `File type ${file.type} is not accepted. Allowed types: ${fileConstraints.acceptedTypes.join(", ")}`;
      }
    }

    if (fileConstraints.acceptedExtensions && fileConstraints.acceptedExtensions.length > 0) {
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      if (!fileConstraints.acceptedExtensions.includes(extension)) {
        return `File extension ${extension} is not accepted. Allowed extensions: ${fileConstraints.acceptedExtensions.join(", ")}`;
      }
    }

    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      onFileChange(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
    onFileChange(file);
  }, [fileConstraints, onFileChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlChange = (url: string) => {
    setFileUrl(url);
    if (onUrlChange) {
      onUrlChange(url);
    }
  };

  const getAcceptAttribute = (): string | undefined => {
    if (!fileConstraints) return undefined;
    
    const types = [];
    if (fileConstraints.acceptedTypes) {
      types.push(...fileConstraints.acceptedTypes);
    }
    if (fileConstraints.acceptedExtensions) {
      types.push(...fileConstraints.acceptedExtensions);
    }
    
    return types.length > 0 ? types.join(",") : undefined;
  };

  const renderContent = () => {
    if (!acceptUrl) {
      return (
        <div className="space-y-3">
          {renderUploadArea()}
          {renderConstraints()}
        </div>
      );
    }

    return (
      <Tabs value={mode} onValueChange={(v) => setMode(v as "upload" | "url")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/30">
          <TabsTrigger value="upload" className="data-[state=active]:bg-purple-500/20">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="data-[state=active]:bg-purple-500/20">
            <LinkIcon className="w-4 h-4 mr-2" />
            Use URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3 space-y-3">
          {renderUploadArea()}
          {renderConstraints()}
        </TabsContent>

        <TabsContent value="url" className="mt-3 space-y-3">
          <Input
            type="url"
            placeholder="https://example.com/file.jpg"
            value={fileUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={disabled}
            className="bg-black/50 border-white/10 text-white focus:border-purple-500"
          />
          <p className="text-xs text-gray-500">
            Enter the URL of the file you want to process
          </p>
          {renderConstraints()}
        </TabsContent>
      </Tabs>
    );
  };

  const renderUploadArea = () => (
    <>
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
          dragActive
            ? "border-purple-500 bg-purple-500/10"
            : "border-white/20 bg-black/30"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-purple-500/50"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept={getAcceptAttribute()}
          disabled={disabled}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded">
                <File className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              disabled={disabled}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-300 mb-1">
              {dragActive ? "Drop file here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
    </>
  );

  const renderConstraints = () => {
    if (!fileConstraints) return null;

    return (
      <div className="space-y-2">
        {fileConstraints.maxSize && (
          <p className="text-xs text-gray-500">
            • Max file size: {formatFileSize(fileConstraints.maxSize)}
          </p>
        )}
        {fileConstraints.acceptedTypes && fileConstraints.acceptedTypes.length > 0 && (
          <p className="text-xs text-gray-500">
            • Accepted types: {fileConstraints.acceptedTypes.join(", ")}
          </p>
        )}
        {fileConstraints.acceptedExtensions && fileConstraints.acceptedExtensions.length > 0 && (
          <p className="text-xs text-gray-500">
            • Accepted extensions: {fileConstraints.acceptedExtensions.join(", ")}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-gray-300">
        {name}
        <span className="text-xs text-gray-500 ml-2">(file)</span>
      </label>
      {renderContent()}
    </div>
  );
}