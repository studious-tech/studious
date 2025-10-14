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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FileUpload } from './file-upload';

const courseFormSchema = z.object({
  exam_id: z.string().min(1, {
    message: 'Please select an exam.',
  }),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  display_name: z.string().min(2, {
    message: 'Display name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  thumbnail_media_id: z.string().optional(),
  difficulty_level: z.string().optional(),
  duration_minutes: z.string().optional(),
  is_active: z.boolean(),
  is_premium: z.boolean(),
  sort_order: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseFormData {
  exam_id: string;
  name: string;
  display_name: string;
  description?: string;
  thumbnail_media_id?: string;
  difficulty_level: number;
  duration_minutes?: number;
  is_active: boolean;
  is_premium: boolean;
  sort_order: number;
}

interface CourseDialogFormProps {
  initialData?: Partial<CourseFormData>;
  onSubmit: (data: CourseFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export function CourseDialogForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Submit',
  loading = false 
}: CourseDialogFormProps) {
  const [uploadedThumbnailFile, setUploadedThumbnailFile] = React.useState<any>(null);
  
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      exam_id: initialData?.exam_id || '',
      name: initialData?.name || '',
      display_name: initialData?.display_name || '',
      description: initialData?.description || '',
      thumbnail_media_id: initialData?.thumbnail_media_id || '',
      difficulty_level: initialData?.difficulty_level?.toString() || '1',
      duration_minutes: initialData?.duration_minutes?.toString() || '',
      is_active: initialData?.is_active ?? true,
      is_premium: initialData?.is_premium ?? false,
      sort_order: initialData?.sort_order?.toString() || '0',
    },
  });

  async function handleSubmit(data: CourseFormValues) {
    try {
      // Convert string fields to appropriate types
      const formData: CourseFormData = {
        exam_id: data.exam_id,
        name: data.name,
        display_name: data.display_name,
        description: data.description,
        thumbnail_media_id: data.thumbnail_media_id,
        difficulty_level: data.difficulty_level ? parseInt(data.difficulty_level, 10) : 1,
        duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes, 10) : undefined,
        is_active: data.is_active,
        is_premium: data.is_premium,
        sort_order: data.sort_order ? parseInt(data.sort_order, 10) : 0,
      };
      
      await onSubmit(formData);
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="exam_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ielts-academic">IELTS Academic</SelectItem>
                    <SelectItem value="pte-academic">PTE Academic</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the exam this course belongs to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Beginner (Level 1)</SelectItem>
                    <SelectItem value="2">Elementary (Level 2)</SelectItem>
                    <SelectItem value="3">Intermediate (Level 3)</SelectItem>
                    <SelectItem value="4">Upper Intermediate (Level 4)</SelectItem>
                    <SelectItem value="5">Advanced (Level 5)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="course-name" {...field} />
              </FormControl>
              <FormDescription>
                Internal name for the course (used in URLs and IDs)
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
                <Input placeholder="Course Display Name" {...field} />
              </FormControl>
              <FormDescription>
                Name shown to users
              </FormDescription>
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
                  placeholder="Describe the course..." 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Brief description of the course
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="120" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Total estimated time for the course
                </FormDescription>
                <FormMessage />
              </FormItem>
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

        <div>
          <FileUpload
            fileType="image"
            label="Course Thumbnail (Optional)"
            description="Upload a thumbnail image for the course (JPEG, PNG, WebP)"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>
                    Enable or disable this course
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

          <FormField
            control={form.control}
            name="is_premium"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Premium</FormLabel>
                  <FormDescription>
                    Premium courses require subscription
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