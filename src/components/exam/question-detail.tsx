'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BookOpen, 
  Clock, 
  Volume2, 
  Image as ImageIcon,
  FileText as FileTextIcon,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface Media {
  id: string;
  original_filename: string;
  file_type: string;
  mime_type: string;
  public_url: string;
  file_size: number;
  duration_seconds?: number;
}

interface QuestionMedia {
  id: string;
  media_role: string;
  media: Media;
}

interface QuestionOption {
  id: string;
  option_text: string;
  is_correct: boolean;
  display_order: number;
}

interface QuestionType {
  id: string;
  name: string;
  display_name: string;
  input_type: string;
  response_type: string;
  scoring_method: string;
  time_limit_seconds: number | null;
}

interface Section {
  id: string;
  name: string;
  display_name: string;
}

interface Exam {
  id: string;
  name: string;
  display_name: string;
}

interface Question {
  id: string;
  title: string;
  content: string;
  instructions: string | null;
  difficulty_level: number;
  expected_duration_seconds: number | null;
  is_active: boolean;
  created_at: string;
  question_types: QuestionType;
  sections: Section;
  exams: Exam;
  question_media: QuestionMedia[];
  question_options: QuestionOption[];
}

interface QuestionDetailProps {
  question: Question;
  examId: string;
}

export function QuestionDetail({ question, examId }: QuestionDetailProps) {
  // Format time as MM:SS
  const formatTime = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get media by role
  const getMediaByRole = (role: string) => {
    return question.question_media?.filter(qm => qm.media_role === role) || [];
  };

  // Get primary media
  const primaryMedia = getMediaByRole('primary');
  const instructionMedia = getMediaByRole('instruction');

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <CardTitle className="text-xl font-bold text-gray-900">
                  {question.title || 'Practice Question'}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  Level {question.difficulty_level}
                </Badge>
                {question.question_types.time_limit_seconds && (
                  <Badge variant="secondary" className="text-xs">
                    {formatTime(question.question_types.time_limit_seconds)}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm">
                {question.exams?.display_name} → {question.sections?.display_name} → {question.question_types?.display_name}
              </CardDescription>
            </div>
            
            {question.expected_duration_seconds && (
              <div className="flex items-center gap-2">
                <div className="flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(question.expected_duration_seconds)}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions */}
          {question.instructions && (
            <Card className="border border-gray-200 bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{question.instructions}</p>
                
                {instructionMedia.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {instructionMedia.map((qm) => (
                      <MediaDisplay key={qm.id} media={qm.media} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Question Content */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Question</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line text-sm">{question.content}</p>
              </div>
              
              {primaryMedia.length > 0 && (
                <div className="mt-4 space-y-3">
                  {primaryMedia.map((qm) => (
                    <MediaDisplay key={qm.id} media={qm.media} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Response Area */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Your Response</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionResponseArea question={question} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Question Info */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Question Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{question.question_types?.display_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Input Type:</span>
                <span className="font-medium capitalize">{question.question_types?.input_type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Response Type:</span>
                <span className="font-medium capitalize">{question.question_types?.response_type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty:</span>
                <span className="font-medium">Level {question.difficulty_level}</span>
              </div>
              {question.expected_duration_seconds && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Limit:</span>
                  <span className="font-medium">{formatTime(question.expected_duration_seconds)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Scoring:</span>
                <span className="font-medium capitalize">{question.question_types?.scoring_method.replace('_', ' ')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Media Info */}
          {question.question_media?.length > 0 && (
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Media Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-gray-600">
                  <span>{question.question_media.length} file(s)</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {question.question_media.map((qm) => (
                    <div key={qm.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                      <div className="flex items-center justify-center h-6 w-6 rounded bg-gray-200">
                        {qm.media.file_type === 'audio' ? (
                          <Volume2 className="h-3 w-3 text-gray-600" />
                        ) : qm.media.file_type === 'image' ? (
                          <ImageIcon className="h-3 w-3 text-gray-600" />
                        ) : (
                          <FileTextIcon className="h-3 w-3 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{qm.media.original_filename}</p>
                        <p className="text-gray-500">
                          {(qm.media.file_size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Panel */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full h-9 text-sm">
                Practice Question
              </Button>
              <Button variant="outline" className="w-full h-9 text-sm">
                Save for Later
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface MediaDisplayProps {
  media: Media;
}

function MediaDisplay({ media }: MediaDisplayProps) {
  if (media.file_type === 'audio') {
    return (
      <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded">
        <div className="flex items-center justify-center h-8 w-8 rounded bg-gray-100">
          <Volume2 className="h-4 w-4 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {media.original_filename}
          </p>
          <p className="text-xs text-gray-500">
            {media.duration_seconds ? `${media.duration_seconds}s` : 'Audio'}
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <Play className="h-3 w-3" />
        </Button>
      </div>
    );
  }
  
  if (media.file_type === 'image') {
    return (
      <div className="space-y-2">
        <div className="aspect-video bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
          {media.public_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={media.public_url} 
              alt={media.original_filename} 
              className="object-contain max-h-64"
            />
          ) : (
            <ImageIcon className="h-10 w-10 text-gray-400" />
          )}
        </div>
        <p className="text-xs text-gray-500 text-center">
          {media.original_filename}
        </p>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded">
      <div className="flex items-center justify-center h-8 w-8 rounded bg-gray-100">
        <FileTextIcon className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {media.original_filename}
        </p>
        <p className="text-xs text-gray-500">
          {(media.file_size / 1024).toFixed(1)} KB
        </p>
      </div>
      <Button variant="outline" size="sm" className="h-8 text-xs">
        Download
      </Button>
    </div>
  );
}

interface QuestionResponseAreaProps {
  question: Question;
}

function QuestionResponseArea({ question }: QuestionResponseAreaProps) {
  if (question.question_types.input_type === 'mcq_single' || 
      question.question_types.input_type === 'mcq_multiple') {
    return (
      <MultipleChoiceResponse 
        options={question.question_options || []}
        isMultiple={question.question_types.input_type === 'mcq_multiple'}
      />
    );
  }
  
  if (question.question_types.input_type === 'audio') {
    return <AudioResponse />;
  }
  
  return <TextResponse placeholder="Type your response here..." />;
}

interface TextResponseProps {
  placeholder: string;
}

function TextResponse({ placeholder }: TextResponseProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="response" className="text-sm">Response</Label>
      <Textarea
        id="response"
        placeholder={placeholder}
        className="min-h-[120px] text-sm"
      />
    </div>
  );
}

function AudioResponse() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200">
          <Volume2 className="h-5 w-5 text-gray-600" />
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-8 text-xs">
            <Play className="h-3 w-3 mr-1" />
            Record
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Square className="h-3 w-3 mr-1" />
            Stop
          </Button>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-500">
        Click "Record" to start recording your response
      </div>
    </div>
  );
}

interface MultipleChoiceResponseProps {
  options: QuestionOption[];
  isMultiple: boolean;
}

function MultipleChoiceResponse({ options, isMultiple }: MultipleChoiceResponseProps) {
  if (options.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        No options available for this question.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm">Select your answer{isMultiple ? 's' : ''}:</Label>
      <RadioGroup className="space-y-2">
        {options
          .sort((a, b) => a.display_order - b.display_order)
          .map((option) => (
            <div 
              key={option.id} 
              className="flex items-start gap-3 p-3 rounded border border-gray-200"
            >
              {isMultiple ? (
                <Checkbox
                  id={option.id}
                  className="mt-0.5"
                />
              ) : (
                <RadioGroupItem 
                  value={option.id} 
                  id={option.id}
                  className="mt-0.5"
                />
              )}
              <Label 
                htmlFor={option.id} 
                className="flex-1 text-gray-900 text-sm"
              >
                {option.option_text}
              </Label>
            </div>
          ))}
      </RadioGroup>
    </div>
  );
}