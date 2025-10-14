'use client';

import { useState, useEffect } from 'react';
import { useExamStore } from '@/stores/exam';
import { useAdminStore } from '@/stores/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  Loader2, 
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MediaManager } from '@/components/admin/content/media-manager';
import React from 'react';

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Very Easy', color: 'bg-green-100 text-green-800' },
  { value: 2, label: 'Easy', color: 'bg-blue-100 text-blue-800' },
  { value: 3, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 4, label: 'Hard', color: 'bg-orange-100 text-orange-800' },
  { value: 5, label: 'Very Hard', color: 'bg-red-100 text-red-800' },
];

interface CreateQuestionFormProps {
  examId: string;
  sectionId: string;
  questionTypeId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function CreateQuestionForm({ 
  examId, 
  sectionId, 
  questionTypeId,
  onBack,
  onSuccess
}: CreateQuestionFormProps) {
  const { createQuestion, fetchExam, selectedExam } = useExamStore();
  const { fetchMedia, uploadMedia } = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [options, setOptions] = useState<{ text: string; is_correct: boolean }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    instructions: '',
    difficulty_level: 1,
    time_limit_seconds: '',
    is_active: true,
  });
  const [activeSection, setActiveSection] = useState<any>(null);
  const [activeQuestionType, setActiveQuestionType] = useState<any>(null);
  const [allowedMediaTypes, setAllowedMediaTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchExam(examId);
    loadMedia();
  }, [examId, fetchExam]);

  useEffect(() => {
    if (selectedExam && selectedExam.sections) {
      const section = selectedExam.sections.find((s: any) => s.id === sectionId);
      if (section) {
        setActiveSection(section);
        const questionType = section.question_types?.find((qt: any) => qt.id === questionTypeId);
        if (questionType) {
          setActiveQuestionType(questionType);
          // Set allowed media types based on question type's input type
          setAllowedMediaTypes(getAllowedMediaTypes(questionType.input_type));
        }
      }
    }
  }, [selectedExam, sectionId, questionTypeId]);

  // Helper function to determine allowed media types based on input type
  const getAllowedMediaTypes = (inputType: string): string[] => {
    switch (inputType.toLowerCase()) {
      case 'image':
        return ['image'];
      case 'audio':
        return ['audio'];
      case 'video':
        return ['video'];
      case 'text':
        return []; // Text questions don't require media, but can have supporting media
      default:
        return ['image', 'audio', 'video', 'document']; // Allow all for unknown types
    }
  };

  const loadMedia = async () => {
    try {
      await fetchMedia(); // Load first page of media
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    // Validate based on question type requirements
    if (activeQuestionType) {
      const validationError = validateQuestionConsistency();
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    setLoading(true);
    
    try {
      const questionData = {
        ...formData,
        question_type_id: questionTypeId,
        time_limit_seconds: formData.time_limit_seconds ? parseInt(formData.time_limit_seconds.toString()) : null,
        difficulty_level: parseInt(formData.difficulty_level.toString()),
        media_ids: selectedMedia,
        options: options.length > 0 ? options : undefined,
      };

      await createQuestion(questionData);
      toast.success('Question created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  // Validate question consistency with question type requirements
  const validateQuestionConsistency = (): string | null => {
    if (!activeQuestionType) return null;

    const inputType = activeQuestionType.input_type.toLowerCase();
    const responseType = activeQuestionType.response_type.toLowerCase();

    // Check if required media is provided for input types that need it
    if (inputType === 'image' && selectedMedia.length === 0) {
      return `This question type requires an image input. Please select at least one image.`;
    }
    if (inputType === 'audio' && selectedMedia.length === 0) {
      return `This question type requires an audio input. Please select at least one audio file.`;
    }
    if (inputType === 'video' && selectedMedia.length === 0) {
      return `This question type requires a video input. Please select at least one video file.`;
    }

    // Check if answer options are provided for selection-based responses
    if (responseType === 'selection' && options.length === 0) {
      return `This question type requires answer options. Please add at least one option.`;
    }
    if (responseType === 'selection' && !options.some(opt => opt.is_correct)) {
      return `Please mark at least one option as correct.`;
    }

    return null;
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const mediaItem = await uploadMedia(file);
        if (mediaItem) {
          setSelectedMedia(prev => [...prev, mediaItem.id]);
        }
      }
      toast.success('Media uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload media');
    } finally {
      setUploadingMedia(false);
    }
  };

  const addOption = () => {
    setOptions(prev => [...prev, { text: '', is_correct: false }]);
  };

  const updateOption = (index: number, field: 'text' | 'is_correct', value: any) => {
    setOptions(prev => prev.map((opt, i) => 
      i === index ? { ...opt, [field]: value } : opt
    ));
  };

  const removeOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMedia(prev => 
      prev.includes(mediaId) 
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  const getDifficultyLevel = (level: number) => {
    return DIFFICULTY_LEVELS.find(d => d.value === level) || DIFFICULTY_LEVELS[0];
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer" onClick={() => window.location.href = '/admin/content/exams'}>
              Exams
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer" onClick={() => window.location.href = `/admin/content/exams/${examId}`}>
              {selectedExam?.display_name || 'Exam'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer" onClick={() => window.location.href = `/admin/content/exams/${examId}/sections/${sectionId}`}>
              {activeSection?.display_name || 'Section'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer" onClick={onBack}>
              {activeQuestionType?.display_name || 'Question Type'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Question</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Create New Question</CardTitle>
              <CardDescription>Create a new question with content and media</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="media">Media & Files</TabsTrigger>
                <TabsTrigger value="options">Answer Options</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Question title"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty_level">
                      Difficulty Level <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-5 gap-2">
                      {DIFFICULTY_LEVELS.map((level) => (
                        <Button
                          key={level.value}
                          type="button"
                          variant={formData.difficulty_level === level.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleChange('difficulty_level', level.value)}
                          disabled={loading}
                          className="h-16 flex flex-col items-center justify-center"
                        >
                          <span className="text-xs">{level.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">
                    Question Content <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="Enter the main question content..."
                    rows={4}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => handleChange('instructions', e.target.value)}
                    placeholder="Additional instructions for students..."
                    rows={3}
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="time_limit_seconds">Time Limit (seconds)</Label>
                    <Input
                      id="time_limit_seconds"
                      type="number"
                      value={formData.time_limit_seconds}
                      onChange={(e) => handleChange('time_limit_seconds', e.target.value)}
                      placeholder="e.g., 60"
                      min="1"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
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
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                {/* Question Type Requirements */}
                {activeQuestionType && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-blue-100 p-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900">Question Type Requirements</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            This question type expects <strong>{activeQuestionType.input_type}</strong> as input 
                            and <strong>{activeQuestionType.response_type}</strong> as response.
                            {allowedMediaTypes.length > 0 && (
                              <span> Please upload {allowedMediaTypes.join(' or ')} media files.</span>
                            )}
                            {allowedMediaTypes.length === 0 && (
                              <span> This question type typically doesn't require media files.</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <MediaManager
                  selectedMedia={selectedMedia}
                  onMediaToggle={toggleMediaSelection}
                  onMediaUpload={handleFileUpload}
                  uploading={uploadingMedia}
                  allowedTypes={allowedMediaTypes}
                  questionType={activeQuestionType}
                />
              </TabsContent>

              <TabsContent value="options" className="space-y-6">
                {/* Answer Options (for MCQ questions) */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Answer Options</CardTitle>
                      <CardDescription>
                        Add multiple choice options (optional - for MCQ questions only)
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {options.length > 0 ? (
                      <div className="space-y-4">
                        {options.map((option, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="flex-1">
                              <Input
                                value={option.text}
                                onChange={(e) => updateOption(index, 'text', e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                disabled={loading}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={option.is_correct}
                                onCheckedChange={(checked) => updateOption(index, 'is_correct', checked)}
                                disabled={loading}
                              />
                              <Label className="text-sm">Correct</Label>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(index)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-full bg-gray-100">
                          <Plus className="h-6 w-6" />
                        </div>
                        <p>No options added</p>
                        <p className="text-sm">Click "Add Option" to create multiple choice answers</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack}
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
                    Create Question
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