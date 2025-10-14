'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Image,
  Music,
  Video,
  FileText,
  File,
  Upload,
  Trash2,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { useAdminStore } from '@/stores/admin';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const MEDIA_TYPES = [
  { type: 'image', icon: Image, label: 'Image', accept: 'image/*' },
  { type: 'audio', icon: Music, label: 'Audio', accept: 'audio/*' },
  { type: 'video', icon: Video, label: 'Video', accept: 'video/*' },
  {
    type: 'document',
    icon: FileText,
    label: 'Document',
    accept: '.pdf,.doc,.docx,.txt',
  },
  { type: 'file', icon: File, label: 'Other Files', accept: '*/*' },
];

interface MediaManagerProps {
  selectedMedia: string[];
  onMediaToggle: (mediaId: string) => void;
  onMediaUpload?: (files: FileList | null) => Promise<void>;
  uploading?: boolean;
  allowedTypes?: string[];
  questionType?: any;
}

export function MediaManager({
  selectedMedia,
  onMediaToggle,
  onMediaUpload,
  uploading = false,
  allowedTypes = [],
  questionType,
}: MediaManagerProps) {
  const { media, fetchMedia, deleteMedia, mediaLoading } = useAdminStore();
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const getMediaIcon = (contentType: string) => {
    if (!contentType) return File;
    if (contentType.startsWith('image/') || contentType === 'image')
      return Image;
    if (contentType.startsWith('audio/') || contentType === 'audio')
      return Music;
    if (contentType.startsWith('video/') || contentType === 'video')
      return Video;
    if (
      contentType.includes('pdf') ||
      contentType.includes('document') ||
      contentType === 'document'
    )
      return FileText;
    return File;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (onMediaUpload) {
      try {
        await onMediaUpload(files);
        setUploadDialogOpen(false);
        toast.success('Media uploaded successfully');
      } catch (error) {
        toast.error('Failed to upload media');
      }
    }
  };

  const handleDeleteMedia = async (mediaId: string, filename: string) => {
    const confirmMessage = questionType
      ? `Are you sure you want to delete "${filename}"? This will remove it from any questions that use it.`
      : `Are you sure you want to delete "${filename}"? This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setDeletingMediaId(mediaId);
    try {
      await deleteMedia(mediaId);
      toast.success('Media deleted successfully');
      // Refresh media list
      await fetchMedia();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete media');
    } finally {
      setDeletingMediaId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload New Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Media
          </CardTitle>
          <CardDescription>
            Upload images, audio, video, or documents to use in questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload Media Files</DialogTitle>
                <DialogDescription>
                  Select files to upload. Supported formats: images, audio,
                  video, documents.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-5">
                {MEDIA_TYPES.filter(
                  (mediaType) =>
                    allowedTypes.length === 0 || // Show all if no restrictions
                    allowedTypes.includes(mediaType.type) ||
                    (allowedTypes.includes('document') &&
                      mediaType.type === 'document') ||
                    (allowedTypes.includes('file') && mediaType.type === 'file')
                ).map((mediaType) => {
                  const Icon = mediaType.icon;
                  const isRestricted =
                    allowedTypes.length > 0 &&
                    !allowedTypes.includes(mediaType.type);

                  return (
                    <div key={mediaType.type} className="text-center">
                      <input
                        type="file"
                        accept={mediaType.accept}
                        multiple
                        className="hidden"
                        id={`upload-${mediaType.type}`}
                        onChange={(e) => handleFileUpload(e.target.files)}
                        disabled={uploading || isRestricted}
                      />
                      <label
                        htmlFor={`upload-${mediaType.type}`}
                        className={`cursor-pointer block p-4 border-2 border-dashed rounded-lg ${
                          isRestricted
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <Icon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {mediaType.label}
                        </span>
                        {isRestricted && (
                          <p className="text-xs text-gray-400 mt-1">
                            Not allowed
                          </p>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
              {uploading && (
                <div className="mt-4 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Uploading media...</span>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Media Library */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>
                Select media to include with this question or manage existing
                files
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMedia()}
              disabled={mediaLoading}
            >
              {mediaLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {media.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {media
                .filter((mediaItem) => {
                  if (allowedTypes.length === 0) return true; // Show all if no restrictions

                  const mediaType = (
                    mediaItem.mime_type ||
                    mediaItem.file_type ||
                    ''
                  ).toLowerCase();
                  return allowedTypes.some(
                    (allowedType) =>
                      mediaType.startsWith(allowedType) ||
                      (allowedType === 'image' &&
                        mediaType.startsWith('image/')) ||
                      (allowedType === 'audio' &&
                        mediaType.startsWith('audio/')) ||
                      (allowedType === 'video' &&
                        mediaType.startsWith('video/')) ||
                      (allowedType === 'document' &&
                        (mediaType.includes('pdf') ||
                          mediaType.includes('document')))
                  );
                })
                .map((mediaItem) => {
                  const Icon = getMediaIcon(
                    mediaItem.mime_type || mediaItem.file_type
                  );
                  const isSelected = selectedMedia.includes(mediaItem.id);
                  const isDeleting = deletingMediaId === mediaItem.id;
                  const isRecommended =
                    allowedTypes.length > 0 &&
                    allowedTypes.some((type) =>
                      (mediaItem.mime_type || mediaItem.file_type || '')
                        .toLowerCase()
                        .startsWith(type)
                    );

                  return (
                    <div
                      key={mediaItem.id}
                      className={`relative border rounded-lg transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : isRecommended
                          ? 'border-green-300 hover:border-green-400 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="p-3 cursor-pointer"
                        onClick={() => onMediaToggle(mediaItem.id)}
                      >
                        <div className="text-center">
                          <Icon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p
                            className="text-sm font-medium truncate"
                            title={mediaItem.original_filename || undefined}
                          >
                            {mediaItem.original_filename}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {mediaItem.file_size
                              ? (mediaItem.file_size / 1024).toFixed(1)
                              : '0'}{' '}
                            KB
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              mediaItem.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-blue-600" />
                        </div>
                      )}

                      <div className="absolute top-2 left-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedia(
                              mediaItem.id,
                              mediaItem.original_filename || 'Unknown file'
                            );
                          }}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>No media available</p>
              <p className="text-sm">Upload some media files to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
