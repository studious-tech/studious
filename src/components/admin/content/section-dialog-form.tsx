'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2 } from 'lucide-react';

interface SectionFormData {
  name: string;
  display_name: string;
  description: string;
  duration_minutes: string;
  order_index: number;
  is_active: boolean;
}

interface SectionDialogFormProps {
  initialData?: Partial<SectionFormData>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
  examSectionCount?: number;
}

export function SectionDialogForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Create Section',
  loading = false,
  examSectionCount = 0
}: SectionDialogFormProps) {
  const [formData, setFormData] = useState<SectionFormData>({
    name: '',
    display_name: '',
    description: '',
    duration_minutes: '',
    order_index: examSectionCount + 1,
    is_active: true,
    ...initialData
  });

  useEffect(() => {
    // Set default order index when section count changes and we're not editing
    if (!initialData.name && examSectionCount >= 0) {
      setFormData(prev => ({
        ...prev,
        order_index: examSectionCount + 1
      }));
    }
  }, [examSectionCount, initialData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.display_name) {
      return;
    }

    const sectionData = {
      ...formData,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes.toString()) : undefined,
      order_index: parseInt(formData.order_index.toString()) || 1,
    };

    await onSubmit(sectionData);
  };

  const handleChange = (field: keyof SectionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., speaking_section"
            disabled={loading}
            required
          />
          <p className="text-xs text-gray-500">
            Used as unique identifier (lowercase, underscores)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_name">
            Display Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) => handleChange('display_name', e.target.value)}
            placeholder="e.g., Speaking Section"
            disabled={loading}
            required
          />
          <p className="text-xs text-gray-500">
            Shown to users in the interface
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe this section..."
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duration_minutes">Duration (minutes)</Label>
          <Input
            id="duration_minutes"
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => handleChange('duration_minutes', e.target.value)}
            placeholder="e.g., 30"
            min="1"
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            Total time allocated for this section (optional)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order_index">
            Order <span className="text-red-500">*</span>
          </Label>
          <Input
            id="order_index"
            type="number"
            value={formData.order_index}
            onChange={(e) => handleChange('order_index', e.target.value)}
            placeholder="1"
            min="1"
            disabled={loading}
            required
          />
          <p className="text-xs text-gray-500">
            Display order in the exam
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => handleChange('is_active', checked)}
          disabled={loading}
        />
        <Label htmlFor="is_active">
          Active (visible to students)
        </Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {submitLabel.includes('Create') ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}