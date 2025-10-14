'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2 } from 'lucide-react';

interface ExamFormData {
  name: string;
  display_name: string;
  description: string;
  duration_minutes: string;
  total_score: number;
  is_active: boolean;
}

interface ExamFormProps {
  initialData?: Partial<ExamFormData>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export function ExamDialogForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Create Exam',
  loading = false 
}: ExamFormProps) {
  const [formData, setFormData] = useState<ExamFormData>({
    name: '',
    display_name: '',
    description: '',
    duration_minutes: '',
    total_score: 100,
    is_active: true,
    ...initialData
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.display_name) {
      return;
    }

    const examData = {
      ...formData,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes.toString()) : undefined,
      total_score: parseInt(formData.total_score.toString()) || 100,
    };

    await onSubmit(examData);
  };

  const handleChange = (field: keyof ExamFormData, value: any) => {
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
            placeholder="e.g., pte-academic"
            disabled={loading}
            required
          />
          <p className="text-xs text-gray-500">
            Used as unique identifier (lowercase, no spaces)
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
            placeholder="e.g., PTE Academic"
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
          placeholder="Describe this exam..."
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
            placeholder="e.g., 180"
            min="1"
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            Total exam duration (optional)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_score">Total Score</Label>
          <Input
            id="total_score"
            type="number"
            value={formData.total_score}
            onChange={(e) => handleChange('total_score', e.target.value)}
            placeholder="100"
            min="1"
            disabled={loading}
            required
          />
          <p className="text-xs text-gray-500">
            Maximum possible score
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