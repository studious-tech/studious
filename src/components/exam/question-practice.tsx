'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Square,
  CheckCircle
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

interface QuestionPracticeProps {
  question: Question;
  examId: string;
}

export function QuestionPractice({ question, examId }: QuestionPracticeProps) {
  const [userResponse, setUserResponse] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(question.expected_duration_seconds || 0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
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

  const handleOptionToggle = (optionId: string) => {
    if (question.question_types.input_type === 'mcq_single') {
      // Single selection
      setSelectedOptions([optionId]);
    } else {
      // Multiple selection
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId) 
          : [...prev, optionId]
      );
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setUserResponse('');
    setSelectedOptions([]);
    setIsSubmitted(false);
    setIsRecording(false);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

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
                <div className={`flex items-center px-2 py-1 rounded text-xs font-medium ${
                  timeLeft < 60 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(timeLeft)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                >
                  {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Question Content - Main Area */}
        <div className="xl:col-span-2 space-y-6">
          {/* Instructions */}
          {question.instructions && (
            <Card className="border border-gray-200 bg-blue-50">
              <CardHeader className="pb-3 border-b border-blue-100">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-blue-800">{question.instructions}</p>
                
                {instructionMedia.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-2">
                      Instruction Media
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {instructionMedia.map((qm) => (
                        <MediaDisplay key={qm.id} media={qm.media} />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Question Content */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-600" />
                Question Content
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="prose max-w-none">
                <p className="text-gray-800 whitespace-pre-line text-sm leading-relaxed">
                  {question.content}
                </p>
              </div>
              
              {primaryMedia.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-2">
                    Question Media
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {primaryMedia.map((qm) => (
                      <MediaDisplay key={qm.id} media={qm.media} />
                    ))}
                  </div>
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
              {isSubmitted ? (
                <SubmissionFeedback 
                  question={question}
                  userResponse={userResponse}
                  selectedOptions={selectedOptions}
                />
              ) : (
                <QuestionResponseArea 
                  question={question}
                  userResponse={userResponse}
                  setUserResponse={setUserResponse}
                  selectedOptions={selectedOptions}
                  onOptionToggle={handleOptionToggle}
                  isRecording={isRecording}
                  onToggleRecording={toggleRecording}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Info and Actions */}
        <div className="space-y-6">
          {/* Action Panel */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Play className="h-4 w-4 text-gray-600" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {!isSubmitted ? (
                <>
                  <Button 
                    className="w-full h-10 text-sm font-medium" 
                    onClick={handleSubmit}
                  >
                    Submit Answer
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-10 text-sm font-medium" 
                    onClick={handleReset}
                  >
                    Reset Response
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-10 text-sm font-medium" 
                  onClick={handleReset}
                >
                  Try Again
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Question Info */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4 text-gray-600" />
                    Question Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="font-medium text-sm">{question.question_types?.display_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Difficulty:</span>
                    <Badge variant="outline" className="text-xs">
                      Level {question.difficulty_level}
                    </Badge>
                  </div>
                  {question.expected_duration_seconds && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Time Limit:</span>
                      <span className="font-medium text-sm">{formatTime(question.expected_duration_seconds)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Input Type:</span>
                    <span className="font-medium text-sm capitalize">
                      {question.question_types?.input_type?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Type:</span>
                    <span className="font-medium text-sm capitalize">
                      {question.question_types?.response_type?.replace('_', ' ')}
                    </span>
                  </div>
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
  const [imageLoaded, setImageLoaded] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (media.file_type === 'audio') {
    return (
      <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-50">
          <Volume2 className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {media.original_filename}
          </p>
          <p className="text-xs text-gray-500">
            {media.duration_seconds ? `${media.duration_seconds}s` : 'Audio file'}
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <Play className="h-3 w-3 mr-1" />
          Play
        </Button>
      </div>
    );
  }
  
  if (media.file_type === 'image') {
    return (
      <div className="space-y-2">
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          {!imageLoaded && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse bg-gray-200 rounded w-full h-full" />
            </div>
          )}
          
          {imageError ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-400">
              <ImageIcon className="h-12 w-12 mb-2" />
              <p className="text-sm">Image failed to load</p>
              <p className="text-xs mt-1">{media.original_filename}</p>
            </div>
          ) : media.public_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={media.public_url} 
              alt={media.original_filename} 
              className={`w-full h-auto max-h-96 object-contain ${!imageLoaded ? 'hidden' : ''}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageLoaded(true);
                setImageError(true);
              }}
              style={{ display: imageLoaded && !imageError ? 'block' : 'none' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-gray-400">
              <ImageIcon className="h-12 w-12 mb-2" />
              <p className="text-sm">No image available</p>
              <p className="text-xs mt-1">{media.original_filename}</p>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 text-center truncate px-2">
          {media.original_filename}
        </p>
      </div>
    );
  }
  
  if (media.file_type === 'video') {
    return (
      <div className="space-y-2">
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden aspect-video flex items-center justify-center">
          <div className="flex flex-col items-center text-gray-500">
            <Play className="h-8 w-8 mb-2" />
            <p className="text-sm">Video: {media.original_filename}</p>
            <p className="text-xs mt-1">{(media.file_size / (1024 * 1024)).toFixed(1)} MB</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full h-8 text-xs">
          Play Video
        </Button>
      </div>
    );
  }
  
  // Document or other file types
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
        <FileTextIcon className="h-5 w-5 text-gray-600" />
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
  userResponse: string;
  setUserResponse: (value: string) => void;
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
}

function QuestionResponseArea({ 
  question, 
  userResponse, 
  setUserResponse, 
  selectedOptions, 
  onOptionToggle,
  isRecording,
  onToggleRecording
}: QuestionResponseAreaProps) {
  // Handle different input types
  if (question.question_types.input_type === 'mcq_single') {
    return (
      <MultipleChoiceResponse 
        options={question.question_options || []}
        selectedOptions={selectedOptions}
        onOptionToggle={onOptionToggle}
        isMultiple={false}
      />
    );
  }
  
  if (question.question_types.input_type === 'mcq_multiple') {
    return (
      <MultipleChoiceResponse 
        options={question.question_options || []}
        selectedOptions={selectedOptions}
        onOptionToggle={onOptionToggle}
        isMultiple={true}
      />
    );
  }
  
  if (question.question_types.input_type === 'audio') {
    return (
      <AudioResponse 
        isRecording={isRecording}
        onToggleRecording={onToggleRecording}
      />
    );
  }
  
  if (question.question_types.input_type === 'text_long') {
    return (
      <TextResponse 
        response={userResponse}
        onChange={setUserResponse}
        placeholder="Type your detailed response here..."
        isLong={true}
      />
    );
  }
  
  // Default text response
  return (
    <TextResponse 
      response={userResponse}
      onChange={setUserResponse}
      placeholder="Type your response here..."
      isLong={false}
    />
  );
}

interface TextResponseProps {
  response: string;
  onChange: (value: string) => void;
  placeholder: string;
  isLong?: boolean;
}

function TextResponse({ response, onChange, placeholder, isLong = false }: TextResponseProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="response" className="text-sm font-medium text-gray-700">
        {isLong ? 'Detailed Response' : 'Your Response'}
      </Label>
      <Textarea
        id="response"
        value={response}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={isLong ? "min-h-[200px] text-sm" : "min-h-[100px] text-sm"}
      />
      <p className="text-xs text-gray-500">
        {isLong 
          ? "Provide a detailed written response. Be as thorough as possible." 
          : "Type your response briefly and clearly."}
      </p>
    </div>
  );
}

interface AudioResponseProps {
  isRecording: boolean;
  onToggleRecording: () => void;
}

function AudioResponse({ isRecording, onToggleRecording }: AudioResponseProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className={`flex items-center justify-center h-16 w-16 rounded-full transition-colors ${
          isRecording ? 'bg-red-100' : 'bg-blue-100'
        }`}>
          {isRecording ? (
            <div className="flex gap-1">
              <div className="w-2 h-8 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-8 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-8 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          ) : (
            <Volume2 className="h-8 w-8 text-blue-600" />
          )}
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            {isRecording ? 'Recording in Progress' : 'Voice Response'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isRecording 
              ? 'Speak clearly into your microphone' 
              : 'Click record to begin speaking'}
          </p>
        </div>
        
        <Button 
          onClick={onToggleRecording}
          size="lg"
          className={`h-12 px-6 text-base ${
            isRecording 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRecording ? (
            <>
              <Square className="h-5 w-5 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              Start Recording
            </>
          )}
        </Button>
      </div>
      
      {isRecording && (
        <div className="text-center">
          <p className="text-xs text-red-600 font-medium animate-pulse">
            ● REC
          </p>
        </div>
      )}
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Tips for speaking tasks:</h4>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>Speak clearly and at a natural pace</li>
          <li>Ensure your microphone is working properly</li>
          <li>Find a quiet environment for recording</li>
          <li>You can re-record if needed</li>
        </ul>
      </div>
    </div>
  );
}

interface MultipleChoiceResponseProps {
  options: QuestionOption[];
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
  isMultiple: boolean;
}

function MultipleChoiceResponse({ 
  options, 
  selectedOptions, 
  onOptionToggle, 
  isMultiple
}: MultipleChoiceResponseProps) {
  if (options.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        No options available for this question.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">
        {isMultiple ? 'Select all that apply:' : 'Select the best answer:'}
      </Label>
      <RadioGroup 
        className="space-y-2"
        value={isMultiple ? undefined : selectedOptions[0]} // For single choice
        onValueChange={isMultiple ? undefined : onOptionToggle} // Only for single choice
      >
        {options
          .sort((a, b) => a.display_order - b.display_order)
          .map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            
            return (
              <div 
                key={option.id} 
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => isMultiple && onOptionToggle(option.id)}
              >
                {isMultiple ? (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onOptionToggle(option.id)}
                    className="mt-1"
                  />
                ) : (
                  <RadioGroupItem 
                    value={option.id} 
                    id={option.id}
                    className="mt-1"
                  />
                )}
                <Label 
                  htmlFor={option.id} 
                  className="flex-1 text-gray-900 cursor-pointer text-sm"
                >
                  {option.option_text}
                </Label>
              </div>
            );
          })}
      </RadioGroup>
      {isMultiple && (
        <p className="text-xs text-gray-500">
          Click checkboxes to select multiple options
        </p>
      )}
    </div>
  );
}

interface SubmissionFeedbackProps {
  question: Question;
  userResponse: string;
  selectedOptions: string[];
}

function SubmissionFeedback({ question, userResponse, selectedOptions }: SubmissionFeedbackProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="h-6 w-6 text-green-600" />
        <div>
          <h3 className="font-medium text-green-800">Response Submitted Successfully</h3>
          <p className="text-sm text-green-700">Your answer has been recorded and is being processed.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-gray-200">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileTextIcon className="h-4 w-4 text-gray-600" />
              Your Response
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {question.question_types.input_type === 'mcq_single' || 
             question.question_types.input_type === 'mcq_multiple' ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Selected Options:</h4>
                {selectedOptions.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2">
                    {selectedOptions.map((optionId, index) => {
                      const option = question.question_options?.find(opt => opt.id === optionId);
                      return (
                        <li key={index} className="text-sm text-gray-700">
                          <span className="font-medium">{String.fromCharCode(65 + (option?.display_order || 1) - 1)}.</span> {option?.option_text || 'Unknown option'}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">No options were selected</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Your Written Response:</h4>
                <div className="p-3 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-wrap min-h-[60px]">
                  {userResponse || <span className="text-gray-500 italic">No response was provided</span>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-600" />
              AI Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <p className="font-medium mb-1">Analysis in Progress</p>
                <p>Your response is being analyzed by our AI system. Detailed feedback will be available shortly.</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">What to Expect:</h4>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>Detailed evaluation of your response</li>
                  <li>Score prediction based on official criteria</li>
                  <li>Specific improvement suggestions</li>
                  <li>Comparison with model answers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}