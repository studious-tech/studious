'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search,
  Upload,
  Image as ImageIcon,
  Music,
  Video,
  FileText,
  Download,
  Trash2,
  Eye,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Media {
  id: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  public_url: string;
  created_at: string;
  created_by: string;
}

interface MediaGalleryProps {
  media: Media[];
  loading: boolean;
  onDelete: (mediaId: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export function MediaGallery({
  media,
  loading,
  onDelete,
  onLoadMore,
  hasMore,
}: MediaGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = media.filter((item) => {
    const matchesSearch = item.original_filename?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || typeFilter === 'all' || item.file_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return ImageIcon;
    if (fileType.startsWith('audio/')) return Music;
    if (fileType.startsWith('video/')) return Video;
    return FileText;
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'bg-blue-100 text-blue-800';
    if (fileType.startsWith('audio/')) return 'bg-green-100 text-green-800';
    if (fileType.startsWith('video/')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }
      }

      toast.success('Files uploaded successfully');
      // Refresh media list
      window.location.reload();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (mediaId: string, filename: string) => {
    if (confirm(`Are you sure you want to delete "${filename}"?`)) {
      try {
        await onDelete(mediaId);
        toast.success('Media deleted successfully');
      } catch (error) {
        toast.error('Failed to delete media');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Upload */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Media Library</CardTitle>
            <CardDescription>
              Manage images, audio, and other media files
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,audio/*,video/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Media'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{media.length}</p>
              <p className="text-sm text-gray-500">Total Files</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {media.filter(m => m.file_type.startsWith('image/')).length}
              </p>
              <p className="text-sm text-gray-500">Images</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {media.filter(m => m.file_type.startsWith('audio/')).length}
              </p>
              <p className="text-sm text-gray-500">Audio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {media.filter(m => m.file_type.startsWith('video/')).length}
              </p>
              <p className="text-sm text-gray-500">Video</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && filteredMedia.length === 0 ? (
          Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-lg" />
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredMedia.length > 0 ? (
          filteredMedia.map((item) => {
            const FileIcon = getFileIcon(item.file_type);
            
            return (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
                  {item.file_type.startsWith('image/') ? (
                    <img
                      src={item.public_url}
                      alt={item.original_filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="secondary" asChild>
                          <a href={item.public_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button size="sm" variant="secondary" asChild>
                          <a href={item.public_url} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {item.original_filename}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getFileTypeColor(item.file_type)}`}
                        >
                          {item.file_type.split('/')[0]}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(item.file_size)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={item.public_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={item.public_url} download>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(item.id, item.original_filename)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchQuery || typeFilter
                    ? 'No media files match your filters'
                    : 'No media files uploaded yet'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First File
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}