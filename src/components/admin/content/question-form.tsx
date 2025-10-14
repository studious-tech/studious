'use client';

import { useState, useEffect } from 'react';
import { useExamStore } from '@/stores/exam';
import { useAdminStore } from '@/stores/admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Upload,
  FileText,
  Image,
  Video,
  Music,
  File,
  X,
  Check,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface QuestionFormProps {
  question?: any;
  questionTypeId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface QuestionOption {
  id?: string;
  text: string;
  media_id?: string;
  is_correct: boolean;
  display_order: number;
}

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Very Easy', color: 'bg-green-100 text-green-800' },
  { value: 2, label: 'Easy', color: 'bg-blue-100 text-blue-800' },
  { value: 3, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 4, label: 'Hard', color: 'bg-orange-100 text-orange-800' },
  { value: 5, label: 'Very Hard', color: 'bg-red-100 text-red-800' },
];

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

export function QuestionForm({
  question,
  questionTypeId,
  open,
  onClose,
  onSuccess,
}: QuestionFormProps) {
  const { createQuestion, updateQuestion } = useExamStore();
  const { fetchMedia, uploadMedia, media, questionTypes, fetchQuestionTypes } =
    useAdminStore();
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [questionType, setQuestionType] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    instructions: '',
    difficulty_level: 1,
    time_limit_seconds: '',
    is_active: true,
  });

  // Determine question type characteristics
  const isMultipleChoice =
    questionType?.input_type === 'multiple_choice' ||
    questionType?.input_type === 'single_choice';
  const isReorderParagraphs =
    questionType?.name === 'reorder_paragraphs' ||
    questionType?.response_type === 'sequence';
  const isMultipleSelection = questionType?.input_type === 'multiple_choice';

  useEffect(() => {
    if (open) {
      // Load available media and question types
      loadMedia();
      loadQuestionType();

      // Initialize form data
      if (question) {
        setFormData({
          title: question.title || '',
          content: question.content || '',
          instructions: question.instructions || '',
          difficulty_level: question.difficulty_level || 1,
          time_limit_seconds:
            question.expected_duration_seconds?.toString() || '',
          is_active: question.is_active ?? true,
        });
        setSelectedMedia(
          question.question_media?.map((qm: any) => qm.media_id) || []
        );
        setOptions(
          question.question_options?.map((opt: any) => ({
            id: opt.id,
            text: opt.option_text,
            media_id: opt.option_media_id,
            is_correct: opt.is_correct,
            display_order: opt.display_order,
          })) || []
        );
      } else {
        setFormData({
          title: '',
          content: '',
          instructions: '',
          difficulty_level: 1,
          time_limit_seconds: '',
          is_active: true,
        });
        setSelectedMedia([]);
        setOptions([]);
      }
    }
  }, [open, question]);

  const loadMedia = async () => {
    try {
      await fetchMedia(); // Load media
      // Media will be available in the admin store
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  };

  const loadQuestionType = async () => {
    try {
      await fetchQuestionTypes();
      const qt = questionTypes.find((qt) => qt.id === questionTypeId);
      setQuestionType(qt);
    } catch (error) {
      console.error('Failed to load question type:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      const questionData = {
        ...formData,
        question_type_id: questionTypeId,
        time_limit_seconds: formData.time_limit_seconds
          ? parseInt(formData.time_limit_seconds.toString())
          : null,
        difficulty_level: parseInt(formData.difficulty_level.toString()),
        media_ids: selectedMedia,
        options: options.length > 0 ? options : undefined,
      };

      if (question) {
        await updateQuestion(question.id, questionData);
        toast.success('Question updated successfully');
      } else {
        await createQuestion(questionData);
        toast.success('Question created successfully');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Log file details for debugging
        console.log('Uploading file:', {
          name: file.name,
          type: file.type,
          size: file.size,
          sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
        });

        const mediaItem = await uploadMedia(file);
        if (mediaItem) {
          setSelectedMedia((prev) => [...prev, mediaItem.id]);
          toast.success(`${file.name} uploaded successfully`);
        }
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      toast.error(error.message || 'Failed to upload media');
    } finally {
      setUploadingMedia(false);
    }
  };

  const addOption = () => {
    const newOrder =
      Math.max(...options.map((o) => o.display_order || 0), 0) + 1;
    setOptions((prev) => [
      ...prev,
      {
        text: isReorderParagraphs
          ? `Paragraph ${newOrder}...`
          : `Option ${String.fromCharCode(64 + newOrder)}`,
        media_id: undefined,
        is_correct: false,
        display_order: newOrder,
      },
    ]);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(options);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order based on new positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index + 1,
    }));

    setOptions(updatedItems);
  };

  const updateOption = (
    index: number,
    field: keyof QuestionOption,
    value: unknown
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMedia((prev) =>
      prev.includes(mediaId)
        ? prev.filter((id) => id !== mediaId)
        : [...prev, mediaId]
    );
  };

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

  const getDifficultyLevel = (level: number) => {
    return (
      DIFFICULTY_LEVELS.find((d) => d.value === level) || DIFFICULTY_LEVELS[0]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] md:min-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? 'Edit Question' : 'Create New Question'}
          </DialogTitle>
          <DialogDescription>
            {question
              ? 'Update question details and content'
              : 'Create a new question with content and media'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="media">Media & Files</TabsTrigger>
              <TabsTrigger value="options">
                {isReorderParagraphs ? 'Paragraphs' : 'Answer Options'}
              </TabsTrigger>
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
                  <Select
                    value={formData.difficulty_level.toString()}
                    onValueChange={(value) =>
                      handleChange('difficulty_level', parseInt(value))
                    }
                    disabled={loading}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem
                          key={level.value}
                          value={level.value.toString()}
                        >
                          <div className="flex items-center gap-2">
                            <Badge className={level.color}>{level.label}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="time_limit_seconds">
                    Time Limit (seconds)
                  </Label>
                  <Input
                    id="time_limit_seconds"
                    type="number"
                    value={formData.time_limit_seconds}
                    onChange={(e) =>
                      handleChange('time_limit_seconds', e.target.value)
                    }
                    placeholder="e.g., 60"
                    min="1"
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      handleChange('is_active', checked)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="is_active">
                    Active (visible to students)
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              {/* Media Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload New Media
                  </CardTitle>
                  <CardDescription>
                    Upload images, audio, video, or documents to use in this
                    question
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-5">
                    {MEDIA_TYPES.map((mediaType) => {
                      const Icon = mediaType.icon;
                      return (
                        <div key={mediaType.type} className="text-center">
                          <input
                            type="file"
                            accept={mediaType.accept}
                            multiple
                            className="hidden"
                            id={`upload-${mediaType.type}`}
                            onChange={(e) => handleFileUpload(e.target.files)}
                            disabled={uploadingMedia}
                          />
                          <label
                            htmlFor={`upload-${mediaType.type}`}
                            className="cursor-pointer block p-4 border-2 border-dashed rounded-lg hover:border-blue-400 hover:bg-blue-50"
                          >
                            <Icon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {mediaType.label}
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  {uploadingMedia && (
                    <div className="mt-4 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Uploading media...</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Media Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Media for Question</CardTitle>
                  <CardDescription>
                    Choose from uploaded media to include with this question
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {media.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {media.map((mediaItem) => {
                        const Icon = getMediaIcon(
                          mediaItem.mime_type || mediaItem.file_type
                        );
                        const isSelected = selectedMedia.includes(mediaItem.id);

                        return (
                          <div
                            key={mediaItem.id}
                            onClick={() => toggleMediaSelection(mediaItem.id)}
                            className={`relative cursor-pointer p-3 border rounded-lg transition-colors ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-center">
                              <Icon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p
                                className="text-sm font-medium truncate"
                                title={mediaItem.original_filename || undefined}
                              >
                                {mediaItem.original_filename}
                              </p>
                              <p className="text-xs text-gray-500">
                                {mediaItem.file_size
                                  ? (mediaItem.file_size / 1024).toFixed(1)
                                  : '0'}{' '}
                                KB
                              </p>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <Check className="h-4 w-4 text-blue-600" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4" />
                      <p>No media available</p>
                      <p className="text-sm">Upload some media files first</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="options" className="space-y-6">
              {/* Answer Options (for MCQ questions) */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>
                      {isReorderParagraphs ? 'Paragraphs' : 'Answer Options'}
                    </CardTitle>
                    <CardDescription>
                      {isReorderParagraphs
                        ? 'Add the paragraphs that students need to reorder. The correct order will be determined by the display order.'
                        : 'Add multiple choice options (optional - for MCQ questions only)'}
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
                    Add {isReorderParagraphs ? 'Paragraph' : 'Option'}
                  </Button>
                </CardHeader>
                <CardContent>
                  {options.length > 0 ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="options">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                          >
                            {options.map((option, index) => (
                              <Draggable
                                key={index}
                                draggableId={index.toString()}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`p-3 border rounded-lg space-y-3 ${
                                      snapshot.isDragging ? 'shadow-lg' : ''
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      {isReorderParagraphs && (
                                        <div
                                          {...provided.dragHandleProps}
                                          className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-gray-600 cursor-grab"
                                        >
                                          <GripVertical className="h-4 w-4" />
                                          <span className="text-xs">
                                            {index + 1}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <Textarea
                                          value={option.text}
                                          onChange={(e) =>
                                            updateOption(
                                              index,
                                              'text',
                                              e.target.value
                                            )
                                          }
                                          placeholder={
                                            isReorderParagraphs
                                              ? `Paragraph ${
                                                  index + 1
                                                } content...`
                                              : `Option ${index + 1} text`
                                          }
                                          disabled={loading}
                                          rows={isReorderParagraphs ? 3 : 1}
                                        />
                                      </div>
                                      {!isReorderParagraphs && (
                                        <div className="flex items-center space-x-2">
                                          <Switch
                                            checked={option.is_correct}
                                            onCheckedChange={(checked) =>
                                              updateOption(
                                                index,
                                                'is_correct',
                                                checked
                                              )
                                            }
                                            disabled={loading}
                                          />
                                          <Label className="text-sm">
                                            Correct
                                          </Label>
                                        </div>
                                      )}
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
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-full bg-gray-100">
                        <Plus className="h-6 w-6" />
                      </div>
                      <p>
                        No {isReorderParagraphs ? 'paragraphs' : 'options'}{' '}
                        added
                      </p>
                      <p className="text-sm">
                        Click "Add{' '}
                        {isReorderParagraphs ? 'Paragraph' : 'Option'}" to
                        create{' '}
                        {isReorderParagraphs
                          ? 'paragraphs'
                          : 'multiple choice answers'}
                      </p>
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
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {question ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {question ? 'Update Question' : 'Create Question'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
