'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
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
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Badge,
} from '@/components/ui/badge';
import { 
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { 
  Save,
  Plus,
  Trash2,
  GripVertical,
  Image,
  Volume2,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminStore } from '@/stores/admin';
import { useRouter } from 'next/navigation';
import { BlanksConfigEditor } from './blanks-config-editor';

interface QuestionOption {
  id: string;
  option_text: string;
  is_correct: boolean;
  option_media_id?: string;
  display_order: number;
}

interface QuestionMedia {
  id: string;
  media_id: string;
  media_role: string;
  display_order: number;
  media?: {
    original_filename: string;
    file_type: string;
    file_size: number;
    mime_type: string;
  };
}

interface EditQuestionFormProps {
  question?: any;
  questionTypes?: any[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export function EditQuestionForm({
  question,
  questionTypes = [],
  onSubmit,
  onCancel,
  submitLabel = 'Save Question',
  loading = false,
}: EditQuestionFormProps) {
  const router = useRouter();
  const { fetchQuestionTypes } = useAdminStore();
  const [availableQuestionTypes, setAvailableQuestionTypes] = useState<any[]>(questionTypes);
  const [activeTab, setActiveTab] = useState('content');
  
  // Basic info
  const [questionTypeId, setQuestionTypeId] = useState(question?.question_type_id || '');
  const [title, setTitle] = useState(question?.title || '');
  const [instructions, setInstructions] = useState(question?.instructions || '');
  const [content, setContent] = useState(question?.content || '');
  const [difficultyLevel, setDifficultyLevel] = useState(question?.difficulty_level?.toString() || '3');
  const [expectedDuration, setExpectedDuration] = useState(question?.expected_duration_seconds?.toString() || '');
  const [isActive, setIsActive] = useState(question?.is_active ?? true);
  
  // Options
  const [options, setOptions] = useState<QuestionOption[]>(() => {
    if (question?.question_options) {
      return [...question.question_options].sort((a, b) => a.display_order - b.display_order);
    }
    return [{ id: 'new-1', option_text: '', is_correct: false, display_order: 0 }];
  });
  
  // Media
  const [media, setMedia] = useState<QuestionMedia[]>(() => {
    if (question?.question_media) {
      return [...question.question_media].sort((a, b) => a.display_order - b.display_order);
    }
    return [];
  });

  // Blanks config
  const [blanksConfig, setBlanksConfig] = useState<any>(() => {
    return question?.blanks_config || null;
  });

  useEffect(() => {
    const loadQuestionTypes = async () => {
      try {
        const types = await fetchQuestionTypes();
        setAvailableQuestionTypes(types);
        if (!questionTypeId && types.length > 0) {
          setQuestionTypeId(types[0].id);
        }
      } catch (error) {
        console.error('Failed to load question types:', error);
      }
    };

    if (questionTypes.length === 0) {
      loadQuestionTypes();
    } else {
      setAvailableQuestionTypes(questionTypes);
    }
  }, [questionTypes, fetchQuestionTypes, questionTypeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionTypeId) {
      toast.error('Please select a question type');
      return;
    }

    const questionData = {
      question_type_id: questionTypeId,
      title: title.trim() || null,
      instructions: instructions.trim() || null,
      content: content.trim() || null,
      difficulty_level: parseInt(difficultyLevel),
      expected_duration_seconds: expectedDuration ? parseInt(expectedDuration) : null,
      is_active: isActive,
      blanks_config: blanksConfig,
      question_options: options.map((option, index) => ({
        ...option,
        display_order: index,
      })),
      question_media: media.map((item, index) => ({
        ...item,
        display_order: index,
      })),
    };

    try {
      await onSubmit(questionData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save question');
    }
  };

  const addOption = () => {
    const newOption: QuestionOption = {
      id: `new-${Date.now()}`,
      option_text: '',
      is_correct: false,
      display_order: options.length,
    };
    setOptions([...options, newOption]);
  };

  const updateOption = (index: number, field: keyof QuestionOption, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(options);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOptions(items);
  };

  const addMedia = () => {
    // Implementation would go here for adding media
    toast.info('Media upload functionality coming soon');
  };

  const removeMedia = (index: number) => {
    const newMedia = [...media];
    newMedia.splice(index, 1);
    setMedia(newMedia);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="blanks">Blanks</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details for this question
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question-type">
                  Question Type <span className="text-red-500">*</span>
                </Label>
                <Select value={questionTypeId} onValueChange={setQuestionTypeId} required>
                  <SelectTrigger id="question-type">
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableQuestionTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Question Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for this question (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Provide specific instructions for answering this question"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">
                  Question Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the main question content"
                  rows={6}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  You can use Markdown or HTML formatting for rich content
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Answer Options</CardTitle>
                  <CardDescription>
                    Configure the possible answers for this question
                  </CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {options.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No options yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Add your first answer option to get started
                  </p>
                  <Button onClick={addOption}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Option
                  </Button>
                </div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="options">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {options.map((option, index) => (
                          <Draggable key={option.id} draggableId={option.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-start gap-3 p-3 border rounded-lg bg-background"
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="mt-3 cursor-move text-muted-foreground hover:text-foreground"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                
                                <div className="flex-1 space-y-2">
                                  <Textarea
                                    value={option.option_text}
                                    onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                                    placeholder={`Enter option ${index + 1}`}
                                    rows={2}
                                  />
                                  
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id={`correct-${index}`}
                                        checked={option.is_correct}
                                        onCheckedChange={(checked) => 
                                          updateOption(index, 'is_correct', checked)
                                        }
                                      />
                                      <Label htmlFor={`correct-${index}`}>
                                        Correct Answer
                                      </Label>
                                    </div>
                                    
                                    {options.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeOption(index)}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blanks" className="space-y-6">
          <BlanksConfigEditor
            questionTypeId={questionTypeId}
            content={content}
            blanksConfig={blanksConfig}
            options={options}
            onBlanksConfigChange={setBlanksConfig}
            onOptionsChange={setOptions}
          />
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Media Assets</CardTitle>
                  <CardDescription>
                    Add images, audio, or other media to enhance this question
                  </CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addMedia}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Media
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {media.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No media assets
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Add images, audio, or documents to enhance your question
                  </p>
                  <Button onClick={addMedia}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Media
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {media.map((item, index) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {item.media?.mime_type?.startsWith('image/') ? (
                                <Image className="h-5 w-5 text-muted-foreground" />
                              ) : item.media?.mime_type?.startsWith('audio/') ? (
                                <Volume2 className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">
                                {item.media?.original_filename || 'Unnamed File'}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {item.media?.file_type?.toUpperCase() || 'FILE'} •{' '}
                                {item.media?.file_size 
                                  ? `${Math.round(item.media.file_size / 1024)} KB` 
                                  : 'Unknown size'}
                              </p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {item.media_role}
                              </Badge>
                            </div>
                          </div>
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedia(index)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <div className="mt-4 p-4 border border-dashed rounded-lg text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop files here or click the "Add Media" button above
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure additional settings for this question
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1 (Beginner)</SelectItem>
                    <SelectItem value="2">Level 2 (Elementary)</SelectItem>
                    <SelectItem value="3">Level 3 (Intermediate)</SelectItem>
                    <SelectItem value="4">Level 4 (Upper Intermediate)</SelectItem>
                    <SelectItem value="5">Level 5 (Advanced)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Expected Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={expectedDuration}
                  onChange={(e) => setExpectedDuration(e.target.value)}
                  placeholder="e.g., 120"
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  Estimated time to complete this question
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable this question for students
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
          {loading && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          )}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}