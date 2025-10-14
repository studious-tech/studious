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

const moduleFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  display_name: z.string().min(2, {
    message: 'Display name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  duration_minutes: z.string().optional(),
  is_active: z.boolean(),
  sort_order: z.string().optional(),
});

type ModuleFormValues = z.infer<typeof moduleFormSchema>;

interface ModuleFormData {
  name: string;
  display_name: string;
  description?: string;
  duration_minutes?: number;
  is_active: boolean;
  sort_order?: number;
}

interface ModuleDialogFormProps {
  initialData?: Partial<ModuleFormData>;
  onSubmit: (data: ModuleFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export function ModuleDialogForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Submit',
  loading = false 
}: ModuleDialogFormProps) {
  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      display_name: initialData?.display_name || '',
      description: initialData?.description || '',
      duration_minutes: initialData?.duration_minutes?.toString() || '',
      is_active: initialData?.is_active ?? true,
      sort_order: initialData?.sort_order?.toString() || '0',
    },
  });

  async function handleSubmit(data: ModuleFormValues) {
    try {
      // Convert string fields to appropriate types
      const formData: ModuleFormData = {
        name: data.name,
        display_name: data.display_name,
        description: data.description,
        duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes, 10) : undefined,
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="module-name" {...field} />
                </FormControl>
                <FormDescription>
                  Internal name for the module (used in URLs and IDs)
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
                  <Input placeholder="Module Display Name" {...field} />
                </FormControl>
                <FormDescription>
                  Name shown to users
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the module..." 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Brief description of the module
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
                    placeholder="60" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Estimated time for the module
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>
                    Enable or disable this module
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