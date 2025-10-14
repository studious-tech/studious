'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, File, Image, Video, Music, X, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  id: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  public_url: string;
  mime_type: string;
}

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onFileUploaded: (file: UploadedFile) => void;
  onFileRemoved?: () => void;
  initialFile?: UploadedFile | null;
  label?: string;
  description?: string;
  fileType?: 'image' | 'video' | 'audio' | 'document' | 'any';
  preview?: boolean;
}

export function FileUpload({
  accept,
  maxSize = 50,
  onFileUploaded,
  onFileRemoved,
  initialFile,
  label = 'Upload File',
  description,
  fileType = 'any',
  preview = true,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(initialFile || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define accept types based on fileType
  const getAcceptTypes = () => {
    if (accept) return accept;
    
    switch (fileType) {
      case 'image':
        return 'image/jpeg,image/png,image/gif,image/webp';
      case 'video':
        return 'video/mp4,video/webm';
      case 'audio':
        return 'audio/mpeg,audio/wav,audio/webm,audio/ogg';
      case 'document':
        return 'application/pdf';
      default:
        return 'image/*,video/*,audio/*,application/pdf';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const uploadFile = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const uploadedFile = await response.json();
      setUploadedFile(uploadedFile);
      onFileUploaded(uploadedFile);
      toast.success('File uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadFile(files[0]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (onFileRemoved) onFileRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderPreview = (file: UploadedFile) => {
    if (!preview) return null;

    if (file.mime_type.startsWith('image/')) {
      return (
        <div className="w-full aspect-video bg-gray-100 rounded overflow-hidden">
          <img 
            src={file.public_url} 
            alt={file.original_filename}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (file.mime_type.startsWith('video/')) {
      return (
        <div className="w-full aspect-video bg-black rounded overflow-hidden">
          <video 
            controls 
            className="w-full h-full"
            preload="metadata"
          >
            <source src={file.public_url} type={file.mime_type} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {label && (
        <div>
          <label className="text-sm font-medium">{label}</label>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      {!uploadedFile ? (
        <Card 
          className={`border-2 border-dashed transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-8">
            {uploading ? (
              <div className="w-full max-w-xs space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max file size: {maxSize}MB
                  </p>
                </div>
              </>
            )}
          </CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptTypes()}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {getFileIcon(uploadedFile.mime_type)}
                  <span className="font-medium text-sm truncate">
                    {uploadedFile.original_filename}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {uploadedFile.file_type.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(uploadedFile.file_size)}
                </p>
                
                {renderPreview(uploadedFile)}
              </div>
              
              <div className="flex gap-1">
                {uploadedFile.public_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(uploadedFile.public_url, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}