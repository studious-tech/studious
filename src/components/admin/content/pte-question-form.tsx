'use client';

import { useState, useEffect } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface PTEQuestionFormProps {
  question?: any;
  questionType: any;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Very Easy', color: 'bg-green-100 text-green-800' },
  { value: 2, label: 'Easy', color: 'bg-blue-100 text-blue-800' },
  { value: 3, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 4, label: 'Hard', color: 'bg-orange-100 text-orange-800' },
  { value: 5, label: 'Very Hard', color: 'bg-red-100 text-red-800' },
];

interface QuestionOption {
  id?: string;
  text: string;
  media_id?: string;
  is_correct: boolean;
  display_order: number;
}

export function PTEQuestionForm({
  question,
  questionType,
  open,
  onClose,
  onSuccess,
}: PTEQuestionFormProps) {
  const { createQuestion, updateQuestion, fetchMedia, uploadMedia, media } =
    useAdminStore();
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [options, setOptions] = useState<QuestionOption[]>([]);

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
    questionType?.name === 'reorder-paragraphs' ||
    questionType?.response_type === 'sequence';
  const isMultipleSelection = questionType?.input_type === 'multiple_choice';

  useEffect(() => {
    if (open) {
      loadMedia();
      initializeForm();
    }
  }, [open, question]);

  const loadMedia = async () => {
    try {
      await fetchMedia();
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  };

  const initializeForm = () => {
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
        instructions: getDefaultInstructions(),
        difficulty_level: 1,
        time_limit_seconds: getDefaultTimeLimit(),
        is_active: true,
      });
      setSelectedMedia([]);
      setOptions(
        isMultipleChoice || isReorderParagraphs ? getDefaultOptions() : []
      );
    }
  };

  const getDefaultInstructions = () => {
    if (isReorderParagraphs) {
      return 'The text boxes in the left panel have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.';
    }
    if (isMultipleChoice && isMultipleSelection) {
      return 'Read the text and answer the multiple-choice question by selecting all correct responses. More than one response is correct.';
    }
    if (isMultipleChoice) {
      return 'Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.';
    }
    return '';
  };

  const getDefaultTimeLimit = () => {
    if (isReorderParagraphs) return '150'; // 2.5 minutes
    if (isMultipleChoice) return '120'; // 2 minutes
    return '';
  };

  const getDefaultOptions = () => {
    if (isReorderParagraphs) {
      return [
        {
          text: 'First paragraph text...',
          is_correct: false,
          display_order: 1,
        },
        {
          text: 'Second paragraph text...',
          is_correct: false,
          display_order: 2,
        },
        {
          text: 'Third paragraph text...',
          is_correct: false,
          display_order: 3,
        },
        {
          text: 'Fourth paragraph text...',
          is_correct: false,
          display_order: 4,
        },
      ];
    }
    if (isMultipleChoice) {
      return [
        { text: 'Option A', is_correct: false, display_order: 1 },
        { text: 'Option B', is_correct: true, display_order: 2 },
        { text: 'Option C', is_correct: false, display_order: 3 },
        { text: 'Option D', is_correct: false, display_order: 4 },
      ];
    }
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    // Validate options based on question type
    if (isMultipleChoice || isReorderParagraphs) {
      if (options.length < 2) {
        toast.error(
          `${
            isReorderParagraphs ? 'Paragraphs' : 'Options'
          } must have at least 2 items`
        );
        return;
      }

      if (isMultipleChoice && !options.some((opt) => opt.is_correct)) {
        toast.error('At least one option must be marked as correct');
        return;
      }

      if (isReorderParagraphs && options.length < 3) {
        toast.error('Reorder paragraphs must have at least 3 paragraphs');
        return;
      }
    }

    setLoading(true);

    try {
      const questionData = {
        ...formData,
        question_type_id: questionType.id,
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
    const newOrder = Math.max(...options.map((o) => o.display_order), 0) + 1;
    setOptions((prev) => [
      ...prev,
      {
        text: isReorderParagraphs
          ? `Paragraph ${newOrder}...`
          : `Option ${String.fromCharCode(64 + newOrder)}`,
        is_correct: false,
        display_order: newOrder,
      },
    ]);
  };

  const updateOption = (
    index: number,
    field: keyof QuestionOption,
    value: any
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
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

  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMedia((prev) =>
      prev.includes(mediaId)
        ? prev.filter((id) => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  const getMediaIcon = (contentType: string) => {
    if (!contentType) return File;
    if (contentType.startsWith('image/')) return Image;
    if (contentType.startsWith('audio/')) return Music;
    if (contentType.startsWith('video/')) return Video;
    if (contentType.includes('pdf') || contentType.includes('document'))
      return FileText;
    return File;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? 'Edit' : 'Create'} {questionType?.display_name} Question
          </DialogTitle>
          <DialogDescription>
            {question
              ? 'Update question details and content'
              : `Create a new ${questionType?.display_name} question`}
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
              {/* Question Type Info */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">
                        Question Type: {questionType?.display_name}
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {questionType?.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Input: {questionType?.input_type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Response: {questionType?.response_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                  {isReorderParagraphs ? 'Reading Passage' : 'Question Content'}{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder={
                    isReorderParagraphs
                      ? 'Enter the reading passage that students will need to understand to reorder the paragraphs correctly...'
                      : 'Enter the main question content...'
                  }
                  rows={6}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleChange('instructions', e.target.value)}
                  placeholder="Instructions for students..."
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
                    placeholder="e.g., 120"
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
                    Upload Media Files
                  </CardTitle>
                  <CardDescription>
                    Upload images, audio, or documents to support this question
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="upload-image"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        disabled={uploadingMedia}
                      />
                      <label
                        htmlFor="upload-image"
                        className="cursor-pointer block p-4 border-2 border-dashed rounded-lg hover:border-blue-400 hover:bg-blue-50"
                      >
                        <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Images</span>
                      </label>
                    </div>
                    <div className="text-center">
                      <input
                        type="file"
                        accept="audio/*"
                        multiple
                        className="hidden"
                        id="upload-audio"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        disabled={uploadingMedia}
                      />
                      <label
                        htmlFor="upload-audio"
                        className="cursor-pointer block p-4 border-2 border-dashed rounded-lg hover:border-blue-400 hover:bg-blue-50"
                      >
                        <Music className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Audio</span>
                      </label>
                    </div>
                    <div className="text-center">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        multiple
                        className="hidden"
                        id="upload-document"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        disabled={uploadingMedia}
                      />
                      <label
                        htmlFor="upload-document"
                        className="cursor-pointer block p-4 border-2 border-dashed rounded-lg hover:border-blue-400 hover:bg-blue-50"
                      >
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Documents</span>
                      </label>
                    </div>
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
              {/* Options/Paragraphs */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>
                      {isReorderParagraphs ? 'Paragraphs' : 'Answer Options'}
                    </CardTitle>
                    <CardDescription>
                      {isReorderParagraphs
                        ? 'Add the paragraphs that students need to reorder. The correct order will be determined by the display order.'
                        : isMultipleSelection
                        ? 'Add multiple choice options. Multiple options can be marked as correct.'
                        : 'Add multiple choice options. Only one option should be marked as correct.'}
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
                                      <div
                                        {...provided.dragHandleProps}
                                        className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-gray-600 cursor-grab"
                                      >
                                        <GripVertical className="h-4 w-4" />
                                        <span className="text-xs">
                                          {index + 1}
                                        </span>
                                      </div>
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
                                              : `Option ${String.fromCharCode(
                                                  65 + index
                                                )} text`
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

              {/* Validation Warnings */}
              {(isMultipleChoice || isReorderParagraphs) &&
                options.length > 0 && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-900">
                            Validation
                          </h4>
                          <div className="text-sm text-yellow-700 mt-1 space-y-1">
                            {isMultipleChoice &&
                              !options.some((opt) => opt.is_correct) && (
                                <p>
                                  ⚠️ At least one option must be marked as
                                  correct
                                </p>
                              )}
                            {isReorderParagraphs && options.length < 3 && (
                              <p>
                                ⚠️ Reorder paragraphs should have at least 3
                                paragraphs
                              </p>
                            )}
                            {options.length < 2 && (
                              <p>
                                ⚠️ At least 2{' '}
                                {isReorderParagraphs ? 'paragraphs' : 'options'}{' '}
                                are required
                              </p>
                            )}
                            {isMultipleChoice &&
                              isMultipleSelection &&
                              options.filter((opt) => opt.is_correct).length ===
                                1 && (
                                <p>
                                  💡 This is a multiple selection question - you
                                  can mark multiple options as correct
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
