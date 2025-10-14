'use client';

import { useState } from 'react';
import { useExamStore } from '@/stores/exam';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { useEffect } from 'react';
import React from 'react';

export default function CreateSectionPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params promise
  const unwrappedParams = React.use(params);
  const { createSection, fetchExam, selectedExam } = useExamStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    duration_minutes: '',
    order_index: 1,
    is_active: true,
  });
  const router = useRouter();

  useEffect(() => {
    fetchExam(unwrappedParams.id);
  }, [unwrappedParams.id, fetchExam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.display_name) {
      toast.error('Name and display name are required');
      return;
    }

    setLoading(true);
    
    try {
      const sectionData = {
        ...formData,
        exam_id: unwrappedParams.id,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes.toString()) : undefined,
        order_index: parseInt(formData.order_index.toString()) || 1,
      };

      await createSection(sectionData);
      toast.success('Section created successfully');
      router.push(`/admin/content/exams/${unwrappedParams.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    router.push(`/admin/content/exams/${unwrappedParams.id}`);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer" onClick={() => router.push('/admin/content/exams')}>
              Exams
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer" onClick={handleBack}>
              {selectedExam?.display_name || 'Exam'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Section</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Create New Section</CardTitle>
              <CardDescription>Add a new section to this exam</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                  placeholder="e.g., speaking"
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
                  placeholder="e.g., Speaking"
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
                rows={2}
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
                  placeholder="e.g., 60"
                  min="1"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Time allocated for this section
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
                onClick={handleBack}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Section
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}