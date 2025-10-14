'use client';

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
import { Save, Loader2, ArrowLeft, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Define logical combinations of input and response types
const QUESTION_TYPE_COMBINATIONS = [
  {
    id: 'read-aloud',
    name: 'read_aloud',
    display_name: 'Read Aloud',
    input_type: 'text',
    response_type: 'audio',
    scoring_method: 'ai_auto',
    description: 'Students read a text passage aloud and are scored by AI',
    time_limit_seconds: 40,
  },
  {
    id: 'repeat-sentence',
    name: 'repeat_sentence',
    display_name: 'Repeat Sentence',
    input_type: 'audio',
    response_type: 'audio',
    scoring_method: 'ai_auto',
    description: 'Students listen to a sentence and repeat it',
    time_limit_seconds: 15,
  },
  {
    id: 'describe-image',
    name: 'describe_image',
    display_name: 'Describe Image',
    input_type: 'image',
    response_type: 'audio',
    scoring_method: 'ai_auto',
    description: 'Students describe what they see in an image',
    time_limit_seconds: 40,
  },
  {
    id: 're-tell-lecture',
    name: 're_tell_lecture',
    display_name: 'Re-tell Lecture',
    input_type: 'multimedia',
    response_type: 'audio',
    scoring_method: 'ai_auto',
    description:
      'Students listen to a lecture audio and view supporting image, then retell it in their own words',
    time_limit_seconds: 60,
  },
  {
    id: 'answer-short-question',
    name: 'answer_short_question',
    display_name: 'Answer Short Question',
    input_type: 'audio',
    response_type: 'audio',
    scoring_method: 'ai_auto',
    description: 'Students answer a short question with a brief response',
    time_limit_seconds: 15,
  },
  {
    id: 'summarize-written-text',
    name: 'summarize_written_text',
    display_name: 'Summarize Written Text',
    input_type: 'text',
    response_type: 'text',
    scoring_method: 'ai_auto',
    description: 'Students summarize a written passage in one sentence',
    time_limit_seconds: 10,
  },
  {
    id: 'write-essay',
    name: 'write_essay',
    display_name: 'Write Essay',
    input_type: 'text',
    response_type: 'text',
    scoring_method: 'ai_manual_review',
    description: 'Students write an essay on a given topic',
    time_limit_seconds: 1200,
  },
  {
    id: 'multiple-choice-single',
    name: 'multiple_choice_single',
    display_name: 'Multiple Choice (Single Answer)',
    input_type: 'single_choice',
    response_type: 'selection',
    scoring_method: 'rule_based',
    description: 'Students select one correct answer from multiple options',
    time_limit_seconds: 120,
  },
  {
    id: 'multiple-choice-multiple',
    name: 'multiple_choice_multiple',
    display_name: 'Multiple Choice (Multiple Answers)',
    input_type: 'multiple_choice',
    response_type: 'selection',
    scoring_method: 'rule_based',
    description: 'Students select multiple correct answers from options',
    time_limit_seconds: 150,
  },
  {
    id: 'fill-in-blanks',
    name: 'fill_in_blanks',
    display_name: 'Fill in the Blanks',
    input_type: 'text',
    response_type: 'text',
    scoring_method: 'rule_based',
    description: 'Students fill in missing words in a passage',
    time_limit_seconds: 60,
  },
  {
    id: 'reorder-paragraphs',
    name: 'reorder_paragraphs',
    display_name: 'Reorder Paragraphs',
    input_type: 'drag_drop',
    response_type: 'sequence',
    scoring_method: 'rule_based',
    description: 'Students reorder scrambled paragraphs into correct order',
    time_limit_seconds: 150,
  },
  {
    id: 'fib-dropdown',
    name: 'fib_dropdown',
    display_name: 'Fill in the Blanks - Dropdown',
    input_type: 'dropdown_selection',
    response_type: 'structured_data',
    scoring_method: 'exact_match',
    description: 'Students choose words from dropdown menus to fill in gaps in a text',
    time_limit_seconds: 120,
  },
  {
    id: 'fib-dragdrop',
    name: 'fib_dragdrop',
    display_name: 'Fill in the Blanks - Drag and Drop',
    input_type: 'drag_drop',
    response_type: 'structured_data',
    scoring_method: 'exact_match',
    description: 'Students drag words from a box to fill in gaps in a text',
    time_limit_seconds: 120,
  },
  {
    id: 'fib-typing',
    name: 'fib_typing',
    display_name: 'Fill in the Blanks - Type In',
    input_type: 'text_input',
    response_type: 'structured_data',
    scoring_method: 'fuzzy_match',
    description: 'Students listen to audio and type missing words in gaps',
    time_limit_seconds: 180,
  },
  {
    id: 'custom',
    name: 'custom',
    display_name: 'Custom Question Type',
    input_type: '',
    response_type: '',
    scoring_method: '',
    description: 'Create a custom question type with your own specifications',
    time_limit_seconds: 60,
  },
];

interface QuestionTypeFormProps {
  questionType?: any;
  sectionId: string;
  examId: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  open?: boolean;
  onClose?: () => void;
  asModal?: boolean; // New prop to control modal vs inline display
}

export function QuestionTypeForm({
  questionType,
  sectionId,
  examId,
  onSubmit,
  onCancel,
  loading,
  open = true,
  onClose,
  asModal = true,
}: QuestionTypeFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    input_type: '',
    response_type: '',
    scoring_method: '',
    ui_component: '',
    time_limit_seconds: '',
    order_index: 1,
    is_active: true,
  });

  // Reset form when component mounts or questionType changes
  useEffect(() => {
    if (questionType) {
      // Editing existing question type
      setFormData({
        name: questionType.name || '',
        display_name: questionType.display_name || '',
        description: questionType.description || '',
        input_type: questionType.input_type || '',
        response_type: questionType.response_type || '',
        scoring_method: questionType.scoring_method || '',
        ui_component: questionType.ui_component || '',
        time_limit_seconds: questionType.time_limit_seconds?.toString() || '',
        order_index: questionType.order_index || 1,
        is_active: questionType.is_active ?? true,
      });
      setSelectedTemplate('custom'); // Set to custom when editing
    } else {
      // Creating new question type - reset to defaults
      setFormData({
        name: '',
        display_name: '',
        description: '',
        input_type: '',
        response_type: '',
        scoring_method: '',
        ui_component: '',
        time_limit_seconds: '',
        order_index: 1,
        is_active: true,
      });
      setSelectedTemplate('custom');
    }
  }, [questionType]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = QUESTION_TYPE_COMBINATIONS.find(
      (t) => t.id === templateId
    );

    if (template && templateId !== 'custom') {
      setFormData((prev) => ({
        ...prev,
        name: template.name,
        display_name: template.display_name,
        description: template.description,
        input_type: template.input_type,
        response_type: template.response_type,
        scoring_method: template.scoring_method,
        ui_component: '', // Will be set manually or auto-generated
        time_limit_seconds: template.time_limit_seconds.toString(),
      }));
    } else if (templateId === 'custom') {
      // Reset to empty for custom
      setFormData((prev) => ({
        ...prev,
        name: '',
        display_name: '',
        description: '',
        input_type: '',
        response_type: '',
        scoring_method: '',
        ui_component: '',
        time_limit_seconds: '',
      }));
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.display_name ||
      !formData.input_type ||
      !formData.response_type ||
      !formData.scoring_method
    ) {
      toast.error('All required fields must be filled');
      return;
    }

    try {
      const questionTypeData = {
        ...formData,
        section_id: sectionId,
        time_limit_seconds: formData.time_limit_seconds
          ? parseInt(formData.time_limit_seconds.toString())
          : undefined,
        order_index: parseInt(formData.order_index.toString()) || 1,
      };

      await onSubmit(questionTypeData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save question type');
    }
  };

  // Render form content
  const formContent = (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Type Template */}
        <div className="space-y-2">
          <Label htmlFor="question_template">Question Type Template</Label>
          <Select
            value={selectedTemplate}
            onValueChange={handleTemplateChange}
            disabled={loading || !!questionType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a question type template" />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPE_COMBINATIONS.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Pre-defined templates help ensure consistency
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., read_aloud"
              disabled={
                loading || (selectedTemplate !== 'custom' && !questionType)
              }
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
              placeholder="e.g., Read Aloud"
              disabled={
                loading || (selectedTemplate !== 'custom' && !questionType)
              }
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
            placeholder="Describe this question type..."
            rows={3}
            disabled={
              loading || (selectedTemplate !== 'custom' && !questionType)
            }
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="ui_component">UI Component</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Component name for rendering (e.g., pte-reading-fib-dropdown)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="ui_component"
            value={formData.ui_component}
            onChange={(e) => handleChange('ui_component', e.target.value)}
            placeholder="e.g., pte-reading-fib-dropdown"
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            Optional: Specify custom UI component for rendering
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="input_type">
                Input Type <span className="text-red-500">*</span>
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>What students see/interact with</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={formData.input_type}
              onValueChange={(value) => handleChange('input_type', value)}
              disabled={
                loading || (selectedTemplate !== 'custom' && !questionType)
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select input type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="image_audio">Image + Audio</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="single_choice">Single Choice</SelectItem>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="dropdown_selection">Dropdown Selection</SelectItem>
                <SelectItem value="drag_drop">Drag & Drop</SelectItem>
                <SelectItem value="text_input">Text Input</SelectItem>
                <SelectItem value="multimedia">Multimedia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="response_type">
                Response Type <span className="text-red-500">*</span>
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>How students respond</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={formData.response_type}
              onValueChange={(value) => handleChange('response_type', value)}
              disabled={
                loading || (selectedTemplate !== 'custom' && !questionType)
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select response type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="long_text">Long Text</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="selection">Selection</SelectItem>
                <SelectItem value="sequence">Sequence</SelectItem>
                <SelectItem value="structured_data">Structured Data</SelectItem>
                <SelectItem value="spoken_response">Spoken Response</SelectItem>
                <SelectItem value="audio_recording">Audio Recording</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="scoring_method">
                Scoring Method <span className="text-red-500">*</span>
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>How responses are scored</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={formData.scoring_method}
              onValueChange={(value) => handleChange('scoring_method', value)}
              disabled={
                loading || (selectedTemplate !== 'custom' && !questionType)
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select scoring method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ai_auto">AI Auto-scoring</SelectItem>
                <SelectItem value="ai_manual_review">
                  AI + Manual Review
                </SelectItem>
                <SelectItem value="rule_based">Rule-based</SelectItem>
                <SelectItem value="exact_match">Exact Match</SelectItem>
                <SelectItem value="fuzzy_match">Fuzzy Match</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="time_limit_seconds">Time Limit (seconds)</Label>
            <Input
              id="time_limit_seconds"
              type="number"
              value={formData.time_limit_seconds}
              onChange={(e) =>
                handleChange('time_limit_seconds', e.target.value)
              }
              placeholder="e.g., 40"
              min="1"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Time limit per question (optional)
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
              Display order in the section
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
          <Label htmlFor="is_active">Active (visible to students)</Label>
        </div>

        {/* Form Actions - only show for inline forms */}
        {!asModal && (
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
                  {questionType ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {questionType
                    ? 'Update Question Type'
                    : 'Create Question Type'}
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );

  // Return as modal or inline based on asModal prop
  if (asModal) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl md:min-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {questionType ? 'Edit Question Type' : 'Create New Question Type'}
            </DialogTitle>
            <DialogDescription>
              Define a new type of question for this section with specific input
              and output patterns
            </DialogDescription>
          </DialogHeader>

          {formContent}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} onClick={handleSubmit}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {questionType ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {questionType
                    ? 'Update Question Type'
                    : 'Create Question Type'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Return as inline form
  return formContent;
}
