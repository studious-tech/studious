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
import { FileText } from 'lucide-react';
import { FileUpload } from './file-upload';

const materialFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  display_name: z.string().min(2, {
    message: 'Display name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  file_media_id: z.string().min(1, {
    message: 'Please select a file.',
  }),
  file_type: z.string().optional(),
  file_size: z.string().optional(),
  is_active: z.boolean(),
  sort_order: z.string().optional(),
});

type MaterialFormValues = z.infer<typeof materialFormSchema>;

interface MaterialFormData {
  name: string;
  display_name: string;
  description?: string;
  file_media_id: string;
  file_type?: string;
  file_size?: number;
  is_active: boolean;
  sort_order?: number;
}

interface MaterialDialogFormProps {
  initialData?: Partial<MaterialFormData>;
  onSubmit: (data: MaterialFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export function MaterialDialogForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Submit',
  loading = false 
}: MaterialDialogFormProps) {
  const [uploadedFile, setUploadedFile] = React.useState<any>(null);
  
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      display_name: initialData?.display_name || '',
      description: initialData?.description || '',
      file_media_id: initialData?.file_media_id || '',
      file_type: initialData?.file_type || '',
      file_size: initialData?.file_size?.toString() || '',
      is_active: initialData?.is_active ?? true,
      sort_order: initialData?.sort_order?.toString() || '0',
    },
  });

  async function handleSubmit(data: MaterialFormValues) {
    try {
      // Convert string fields to appropriate types
      const formData: MaterialFormData = {
        name: data.name,
        display_name: data.display_name,
        description: data.description,
        file_media_id: data.file_media_id,
        file_type: data.file_type,
        file_size: data.file_size ? parseInt(data.file_size, 10) : undefined,
        is_active: data.is_active,
        sort_order: data.sort_order ? parseInt(data.sort_order, 10) : undefined,
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
                    <Input placeholder="material-name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Internal name for the material (used in URLs and IDs)
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
                    <Input placeholder="Material Display Name" {...field} />
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
                      placeholder="Describe the material..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description of the material
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FileUpload
                fileType="any"
                label="Material File"
                description="Upload a course material file (PDF, documents, images, etc.)"
                maxSize={25}
                onFileUploaded={(file) => {
                  setUploadedFile(file);
                  form.setValue('file_media_id', file.id);
                  form.setValue('file_type', file.file_type);
                  form.setValue('file_size', file.file_size.toString());
                }}
                onFileRemoved={() => {
                  setUploadedFile(null);
                  form.setValue('file_media_id', '');
                  form.setValue('file_type', '');
                  form.setValue('file_size', '');
                }}
                initialFile={
                  initialData?.file_media_id
                    ? {
                        id: initialData.file_media_id,
                        original_filename: initialData.display_name || 'Current Material',
                        file_type: initialData.file_type || 'document',
                        file_size: initialData.file_size || 0,
                        public_url: `/api/media/${initialData.file_media_id}`,
                        mime_type: 'application/pdf',
                      }
                    : null
                }
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10).toString() : '0')}
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
                      Enable or disable this material
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
              {uploadedFile || form.watch('file_media_id') ? (
                <div className="text-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="font-medium">
                    {uploadedFile?.original_filename || form.watch('display_name') || 'Material Preview'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploadedFile?.file_type?.toUpperCase() || form.watch('file_type') || 'FILE'} •{' '}
                    {uploadedFile ? 
                      `${Math.round(uploadedFile.file_size / 1024)} KB` : 
                      (form.watch('file_size') 
                        ? `${Math.round(parseInt(form.watch('file_size') || '0') / 1024)} KB` 
                        : 'N/A')}
                  </p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                  <p>Material preview will appear here</p>
                  <p className="text-sm mt-2">
                    Upload a file to preview
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