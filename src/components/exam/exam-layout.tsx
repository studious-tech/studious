'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Volume2, 
  Pause, 
  Play, 
  Square,
  RotateCcw,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

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

interface ExamLayoutProps {
  question: Question;
  examId: string;
  onExit: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentPosition: number;
  totalQuestions: number;
}

export function ExamLayout({ 
  question, 
  examId,
  onExit,
  onNext,
  onPrevious,
  currentPosition,
  totalQuestions
}: ExamLayoutProps) {
  // State for audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // State for image viewing
  const [fullscreenImage, setFullscreenImage] = useState<{url: string, name: string} | null>(null);
  
  // State for selected options
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  // State for text response
  const [textResponse, setTextResponse] = useState('');
  
  // State for timer
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // State for navigation panel
  const [showNavigation, setShowNavigation] = useState(true);
  
  // State for instructions visibility
  const [showInstructions, setShowInstructions] = useState(true);

  // Format time as MM:SS
  const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return null;
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

  // Start timer if question has time limit
  useEffect(() => {
    if (question.question_types.time_limit_seconds) {
      setTimeRemaining(question.question_types.time_limit_seconds);
      
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            if (prev === 1) {
              toast.info('Time is up for this question');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [question.question_types.time_limit_seconds]);

  // Handle audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setAudioDuration(Math.floor(audioChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0) / 10000)); // Approx duration
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      toast.error('Failed to access microphone. Please check your permissions.');
      console.error('Microphone access error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle option selection
  const handleOptionSelect = (optionId: string, isMultiple: boolean) => {
    if (isMultiple) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId) 
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  // Handle fullscreen image
  const openFullscreenImage = (url: string, name: string) => {
    setFullscreenImage({ url, name });
  };

  const closeFullscreenImage = () => {
    setFullscreenImage(null);
  };

  // Handle download
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset response
  const resetResponse = () => {
    setSelectedOptions([]);
    setTextResponse('');
    setAudioUrl(null);
    setAudioDuration(0);
    if (isRecording) {
      stopRecording();
    }
  };

  // Submit response
  const submitResponse = () => {
    toast.success('Your response has been submitted');
    onNext();
  };

  // Pause exam
  const pauseExam = () => {
    toast.info('Exam paused');
    // In a real implementation, you would pause the timer and show a pause screen
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={closeFullscreenImage}
        >
          <div className="relative max-w-6xl max-h-full">
            <Button 
              variant="secondary" 
              size="sm" 
              className="absolute top-4 right-4"
              onClick={(e) => {
                e.stopPropagation();
                closeFullscreenImage();
              }}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <img 
              src={fullscreenImage.url} 
              alt={fullscreenImage.name} 
              className="max-h-[90vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
              {fullscreenImage.name}
            </div>
          </div>
        </div>
      )}

      {/* Exam Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="font-medium text-gray-900">
            {question.exams?.display_name} - {question.sections?.display_name}
          </div>
          <div className="hidden sm:block text-sm text-gray-500">
            {question.question_types?.display_name}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {question.question_types.time_limit_seconds && (
            <div className={`flex items-center px-3 py-1 rounded text-sm font-medium ${
              timeRemaining !== null && timeRemaining < 30 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              <span className="mr-1">
                {timeRemaining !== null ? formatTime(timeRemaining) : formatTime(question.question_types.time_limit_seconds)}
              </span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={pauseExam}
            className="h-8 w-8 p-0"
          >
            <Pause className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Question Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Question Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-lg font-medium text-gray-900">
                  Question {currentPosition + 1} of {totalQuestions}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Level {question.difficulty_level}</span>
                </div>
              </div>
              
              {question.title && (
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {question.title}
                </h2>
              )}
            </div>

            {/* Instructions Panel */}
            {question.instructions && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => setShowInstructions(!showInstructions)}
                >
                  <h3 className="font-medium text-blue-900 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Instructions
                  </h3>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    {showInstructions ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {showInstructions && (
                  <div className="px-3 pb-3">
                    <div className="text-sm text-gray-700 whitespace-pre-line border-t border-blue-100 pt-3">
                      {question.instructions}
                    </div>
                    
                    {instructionMedia.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {instructionMedia.map((qm) => (
                          <MediaDisplay 
                            key={qm.id} 
                            media={qm.media} 
                            onFullscreen={openFullscreenImage}
                            onDownload={handleDownload}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Question Content */}
            <div className="mb-6">
              <div className="prose max-w-none bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-gray-800 whitespace-pre-line">{question.content}</p>
              </div>
              
              {primaryMedia.length > 0 && (
                <div className="mt-4 space-y-3">
                  {primaryMedia.map((qm) => (
                    <MediaDisplay 
                      key={qm.id} 
                      media={qm.media} 
                      onFullscreen={openFullscreenImage}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Response Area */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Your Response</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetResponse}
                  className="text-xs h-7"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
              
              <QuestionResponseArea 
                question={question}
                selectedOptions={selectedOptions}
                onOptionSelect={handleOptionSelect}
                textResponse={textResponse}
                onTextResponseChange={setTextResponse}
                isRecording={isRecording}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                audioUrl={audioUrl}
                audioDuration={audioDuration}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        {showNavigation && (
          <div className="w-full md:w-80 border-l border-gray-200 bg-white flex flex-col">
            {/* Navigation Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Navigation</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 md:hidden"
                  onClick={() => setShowNavigation(false)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {currentPosition + 1} of {totalQuestions} questions
              </p>
            </div>
            
            {/* Question Palette */}
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: totalQuestions }).map((_, index) => (
                  <Button
                    key={index}
                    variant={index === currentPosition ? "default" : "outline"}
                    size="sm"
                    className="h-10 text-xs"
                    onClick={() => {
                      // In a real implementation, you would navigate to the specific question
                      if (index !== currentPosition) {
                        toast.info(`Navigate to question ${index + 1}`);
                      }
                    }}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-200 space-y-3">
              <Button 
                className="w-full"
                onClick={submitResponse}
              >
                Next Question
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={onPrevious}
                  disabled={currentPosition === 0}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={onNext}
                >
                  Skip
                </Button>
              </div>
              <Button 
                variant="ghost" 
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onExit}
              >
                Exit Exam
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation Toggle */}
      {!showNavigation && (
        <div className="md:hidden bg-white border-t border-gray-200 p-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setShowNavigation(true)}
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Show Navigation
          </Button>
        </div>
      )}
    </div>
  );
}

interface MediaDisplayProps {
  media: Media;
  onFullscreen?: (url: string, name: string) => void;
  onDownload?: (url: string, filename: string) => void;
}

function MediaDisplay({ media, onFullscreen, onDownload }: MediaDisplayProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800">Failed to load media</p>
          <p className="text-xs text-red-600 truncate">{media.original_filename}</p>
        </div>
        {onDownload && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs"
            onClick={() => onDownload(media.public_url, media.original_filename)}
          >
            Download
          </Button>
        )}
      </div>
    );
  }

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
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-xs"
          onClick={() => onDownload && onDownload(media.public_url, media.original_filename)}
        >
          <Play className="h-3 w-3" />
        </Button>
      </div>
    );
  }
  
  if (media.file_type === 'image') {
    return (
      <div className="space-y-2">
        <div className="bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center relative">
          {media.public_url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={media.public_url} 
                alt={media.original_filename} 
                className="w-full h-auto max-h-96 object-contain"
                onError={() => setError(true)}
              />
              {onFullscreen && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="absolute top-2 right-2 h-7 w-7 p-0"
                  onClick={() => onFullscreen(media.public_url, media.original_filename)}
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Image not available</p>
            </div>
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
        <Volume2 className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {media.original_filename}
        </p>
        <p className="text-xs text-gray-500">
          {(media.file_size / 1024).toFixed(1)} KB
        </p>
      </div>
      {onDownload && (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-xs"
          onClick={() => onDownload(media.public_url, media.original_filename)}
        >
          Download
        </Button>
      )}
    </div>
  );
}

interface QuestionResponseAreaProps {
  question: Question;
  selectedOptions: string[];
  onOptionSelect: (optionId: string, isMultiple: boolean) => void;
  textResponse: string;
  onTextResponseChange: (value: string) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  audioUrl: string | null;
  audioDuration: number;
}

function QuestionResponseArea({ 
  question, 
  selectedOptions,
  onOptionSelect,
  textResponse,
  onTextResponseChange,
  isRecording,
  onStartRecording,
  onStopRecording,
  audioUrl,
  audioDuration
}: QuestionResponseAreaProps) {
  if (question.question_types.input_type === 'mcq_single' || 
      question.question_types.input_type === 'mcq_multiple') {
    return (
      <MultipleChoiceResponse 
        options={question.question_options || []}
        isMultiple={question.question_types.input_type === 'mcq_multiple'}
        selectedOptions={selectedOptions}
        onOptionSelect={(optionId) => onOptionSelect(optionId, question.question_types.input_type === 'mcq_multiple')}
      />
    );
  }
  
  if (question.question_types.input_type === 'audio') {
    return (
      <AudioResponse 
        isRecording={isRecording}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
        audioUrl={audioUrl}
        audioDuration={audioDuration}
      />
    );
  }
  
  return (
    <TextResponse 
      placeholder="Type your response here..." 
      value={textResponse}
      onChange={onTextResponseChange}
    />
  );
}

interface TextResponseProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function TextResponse({ placeholder, value, onChange }: TextResponseProps) {
  return (
    <div className="space-y-2">
      <textarea
        placeholder={placeholder}
        className="w-full min-h-[120px] p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

interface AudioResponseProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  audioUrl: string | null;
  audioDuration: number;
}

function AudioResponse({ isRecording, onStartRecording, onStopRecording, audioUrl, audioDuration }: AudioResponseProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200">
          <Volume2 className="h-5 w-5 text-gray-600" />
        </div>
        
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Button 
              size="sm" 
              className="h-8 text-xs"
              onClick={onStartRecording}
            >
              <Play className="h-3 w-3 mr-1" />
              Record
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-8 text-xs"
              onClick={onStopRecording}
            >
              <Square className="h-3 w-3 mr-1" />
              Stop
            </Button>
          )}
          
          {audioUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => {
                const audio = new Audio(audioUrl);
                audio.play();
              }}
            >
              <Play className="h-3 w-3 mr-1" />
              Play
            </Button>
          )}
        </div>
        
        {audioUrl && (
          <div className="text-xs text-gray-600">
            Recorded: {audioDuration} seconds
          </div>
        )}
      </div>
      
      <div className="text-center text-xs text-gray-500">
        {isRecording ? (
          <span className="flex items-center justify-center gap-1">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
              <span className="relative h-2 w-2 rounded-full bg-red-500"></span>
            </span>
            Recording in progress...
          </span>
        ) : (
          "Click \"Record\" to start recording your response"
        )}
      </div>
    </div>
  );
}

interface MultipleChoiceResponseProps {
  options: QuestionOption[];
  isMultiple: boolean;
  selectedOptions: string[];
  onOptionSelect: (optionId: string) => void;
}

function MultipleChoiceResponse({ options, isMultiple, selectedOptions, onOptionSelect }: MultipleChoiceResponseProps) {
  if (options.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        No options available for this question.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {options
          .sort((a, b) => a.display_order - b.display_order)
          .map((option) => (
            <div 
              key={option.id} 
              className={`flex items-start gap-3 p-3 rounded border transition-colors cursor-pointer ${
                selectedOptions.includes(option.id) 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onOptionSelect(option.id)}
            >
              {isMultiple ? (
                <div className={`flex items-center justify-center h-5 w-5 rounded border ${
                  selectedOptions.includes(option.id) 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedOptions.includes(option.id) && (
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              ) : (
                <div className={`flex items-center justify-center h-5 w-5 rounded-full border ${
                  selectedOptions.includes(option.id) 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedOptions.includes(option.id) && (
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  )}
                </div>
              )}
              <div className="flex-1 text-gray-900 text-sm">
                {option.option_text}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}