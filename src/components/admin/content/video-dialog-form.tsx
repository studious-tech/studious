'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FileUpload } from './file-upload';

const videoFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  display_name: z.string().min(2, {
    message: 'Display name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  video_type: z.enum(['upload', 'youtube'], {
    message: 'Please select a video type.',
  }),
  video_url: z.string().optional(),
  video_media_id: z.string().optional(),
  thumbnail_media_id: z.string().optional(),
  duration_seconds: z.number().nullable().optional(),
  is_active: z.boolean(),
  sort_order: z.number().optional(),
});

type VideoFormValues = z.infer<typeof videoFormSchema>;

interface VideoFormData {
  name: string;
  display_name: string;
  description?: string;
  video_type: 'upload' | 'youtube';
  video_url?: string;
  video_media_id?: string;
  thumbnail_media_id?: string;
  duration_seconds?: number | null;
  is_active: boolean;
  sort_order?: number;
}

interface VideoDialogFormProps {
  initialData?: Partial<VideoFormData>;
  onSubmit: (data: VideoFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export function VideoDialogForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  loading = false,
}: VideoDialogFormProps) {
  const [uploadedVideoFile, setUploadedVideoFile] = React.useState<any>(null);
  const [uploadedThumbnailFile, setUploadedThumbnailFile] =
    React.useState<any>(null);
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      display_name: initialData?.display_name || '',
      description: initialData?.description || '',
      video_type: initialData?.video_type || 'upload',
      video_url: initialData?.video_url || '',
      video_media_id: initialData?.video_media_id || '',
      thumbnail_media_id: initialData?.thumbnail_media_id || '',
      duration_seconds: initialData?.duration_seconds || null,
      is_active: initialData?.is_active ?? true,
      sort_order: initialData?.sort_order || 0,
    },
  });

  const videoType = form.watch('video_type');

  async function handleSubmit(data: VideoFormValues) {
    try {
      // Convert data to proper types
      const formData: VideoFormData = {
        name: data.name,
        display_name: data.display_name,
        description: data.description,
        video_type: data.video_type as 'upload' | 'youtube',
        video_url: data.video_url,
        video_media_id: data.video_media_id,
        thumbnail_media_id: data.thumbnail_media_id,
        duration_seconds: data.duration_seconds,
        is_active: data.is_active,
        sort_order: data.sort_order,
      };

      await onSubmit(formData);
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="video-name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Internal name for the video (used in URLs and IDs)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Video Display Name" {...field} />
                  </FormControl>
                  <FormDescription>Name shown to users</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the video..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description of the video content
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Video Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="upload" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Upload Video
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="youtube" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          YouTube Video
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {videoType === 'youtube' ? (
              <FormField
                control={form.control}
                name="video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Paste the YouTube video URL
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-4">
                <div>
                  <FileUpload
                    fileType="video"
                    label="Video File"
                    description="Upload a video file (MP4 or WebM)"
                    maxSize={100}
                    onFileUploaded={(file) => {
                      setUploadedVideoFile(file);
                      form.setValue('video_media_id', file.id);
                      if (
                        file.mime_type === 'video/mp4' &&
                        !form.getValues('duration_seconds')
                      ) {
                        // Could extract duration from video metadata here
                      }
                    }}
                    onFileRemoved={() => {
                      setUploadedVideoFile(null);
                      form.setValue('video_media_id', '');
                    }}
                    initialFile={
                      initialData?.video_media_id
                        ? {
                            id: initialData.video_media_id,
                            original_filename: 'Current Video',
                            file_type: 'video',
                            file_size: 0,
                            public_url: `/api/media/${initialData.video_media_id}`,
                            mime_type: 'video/mp4',
                          }
                        : null
                    }
                  />
                </div>

                <div>
                  <FileUpload
                    fileType="image"
                    label="Thumbnail (Optional)"
                    description="Upload a thumbnail image (JPEG, PNG, WebP)"
                    maxSize={10}
                    onFileUploaded={(file) => {
                      setUploadedThumbnailFile(file);
                      form.setValue('thumbnail_media_id', file.id);
                    }}
                    onFileRemoved={() => {
                      setUploadedThumbnailFile(null);
                      form.setValue('thumbnail_media_id', '');
                    }}
                    initialFile={
                      initialData?.thumbnail_media_id
                        ? {
                            id: initialData.thumbnail_media_id,
                            original_filename: 'Current Thumbnail',
                            file_type: 'image',
                            file_size: 0,
                            public_url: `/api/media/${initialData.thumbnail_media_id}`,
                            mime_type: 'image/jpeg',
                          }
                        : null
                    }
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration_seconds"
                render={({ field }) => (
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="300"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                )}
              />

              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value ?? 0}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : 0
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Display order (lower numbers first)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Enable or disable this video
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-muted rounded-lg p-4 h-full flex items-center justify-center">
              {videoType === 'youtube' && form.watch('video_url') ? (
                <div className="w-full aspect-video bg-black rounded overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(
                      form.watch('video_url') || ''
                    )}`}
                    title="YouTube video player"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : videoType === 'upload' &&
                (uploadedVideoFile || form.watch('video_media_id')) ? (
                <div className="w-full aspect-video bg-black rounded overflow-hidden flex items-center justify-center">
                  <video
                    controls
                    className="w-full h-full"
                    poster={
                      uploadedThumbnailFile?.public_url ||
                      (form.watch('thumbnail_media_id')
                        ? `/api/media/${form.watch('thumbnail_media_id')}`
                        : undefined)
                    }
                  >
                    <source
                      src={
                        uploadedVideoFile?.public_url ||
                        `/api/media/${form.watch('video_media_id')}`
                      }
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                  <p>Video preview will appear here</p>
                  <p className="text-sm mt-2">
                    {videoType === 'youtube'
                      ? 'Enter a YouTube URL to preview'
                      : 'Upload a video file to preview'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            )}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Helper function to extract YouTube video ID from URL
function extractYouTubeId(url: string): string {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/user\/[^\/]+#p\/[a-zA-Z]\/[0-9]\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return '';
}
