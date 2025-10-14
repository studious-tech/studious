'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Mic,
  MicOff,
  Square,
  Play,
  RotateCcw,
  Timer,
  CheckCircle2,
  Volume2,
  BookOpen,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuestionData {
  question: {
    id: string;
    title: string | null;
    content: string | null;
    instructions: string | null;
    difficulty_level: number;
    expected_duration_seconds: number | null;
    correct_answer: unknown;
    blanks_config: unknown;
    question_type_id: string;
    questionType: {
      id: string;
      name: string;
      display_name: string;
      description: string | null;
      input_type: string;
      response_type: string;
      scoring_method: string;
      time_limit_seconds: number | null;
      ui_component: string;
      section: {
        id: string;
        name: string;
        display_name: string;
        exam: {
          id: string;
          name: string;
          display_name: string;
        };
      };
    };
    media: Array<{
      id: string;
      role: string;
      display_order: number;
      media: {
        id: string;
        filename: string;
        file_type: string;
        mime_type: string;
        url: string;
        duration_seconds?: number;
        dimensions?: unknown;
      };
    }>;
    options: Array<{
      id: string;
      text: string;
      is_correct: boolean;
      display_order: number;
      media_id?: string;
    }>;
  };
  sessionQuestionId: string;
  sequenceNumber: number;
}

interface SpeakingQuestionProps {
  question: QuestionData;
  examId: string;
  onResponse: (response: {
    questionId: string;
    sessionQuestionId: string;
    response: unknown;
    responseType: string;
  }) => void;
  onSubmit: (response: {
    questionId: string;
    sessionQuestionId: string;
    response: unknown;
    responseType: string;
  }) => void;
  currentResponse?: any;
}

export function SpeakingQuestion({
  question,
  examId,
  onResponse,
  onSubmit,
  currentResponse,
}: SpeakingQuestionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(
    currentResponse?.audioUrl || null
  );
  const [preparationTime, setPreparationTime] = useState(30);
  const [isPreparationPhase, setIsPreparationPhase] = useState(true);
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [textResponse, setTextResponse] = useState<string>(
    currentResponse?.text || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const preparationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const questionData = question.question;

  // Preparation phase countdown
  useEffect(() => {
    if (isPreparationPhase && preparationTime > 0) {
      preparationTimerRef.current = setInterval(() => {
        setPreparationTime((prev) => {
          if (prev <= 1) {
            setIsPreparationPhase(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (preparationTimerRef.current)
        clearInterval(preparationTimerRef.current);
    };
  }, [isPreparationPhase, preparationTime]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }

    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);

        onResponse({
          questionId: questionData.id,
          sessionQuestionId: question.sessionQuestionId,
          response: { audioUrl, text: textResponse },
          responseType: 'audio_recording',
        });

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setHasStartedRecording(true);
      setRecordingTime(0);
    } catch (error) {
      toast.error(
        'Failed to access microphone. Please check your permissions.'
      );
      console.error('Microphone access error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    setHasStartedRecording(false);
    setIsPreparationPhase(true);
    setPreparationTime(30);
    if (isRecording) {
      stopRecording();
    }
  };

  const handleTextChange = (value: string) => {
    setTextResponse(value);

    // Auto-save the response
    onResponse({
      questionId: questionData.id,
      sessionQuestionId: question.sessionQuestionId,
      response: { text: value, audioUrl },
      responseType: 'text',
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        questionId: questionData.id,
        sessionQuestionId: question.sessionQuestionId,
        response: { text: textResponse, audioUrl },
        responseType: audioUrl ? 'audio_recording' : 'text',
      });
      toast.success('Answer submitted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render question media
  const renderMedia = (media: QuestionData['question']['media'][0]) => {
    const { mime_type, url, filename } = media.media;

    if (mime_type?.startsWith('image/')) {
      return (
        <div key={media.id} className="mt-4">
          <div className="text-sm text-muted-foreground mb-2 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            {filename}
          </div>
          <img
            src={url}
            alt={filename}
            className="max-w-full h-auto rounded-lg border"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.svg';
            }}
          />
        </div>
      );
    } else if (mime_type?.startsWith('audio/')) {
      return (
        <div key={media.id} className="mt-4">
          <div className="text-sm text-muted-foreground mb-2 flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            {filename}
          </div>
          <audio controls className="w-full">
            <source src={url} type={mime_type} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    } else if (mime_type?.startsWith('video/')) {
      return (
        <div key={media.id} className="mt-4">
          <div className="text-sm text-muted-foreground mb-2 flex items-center">
            <Play className="h-4 w-4 mr-2" />
            {filename}
          </div>
          <video controls className="w-full max-w-2xl rounded-lg border">
            <source src={url} type={mime_type} />
            Your browser does not support the video element.
          </video>
        </div>
      );
    } else {
      return (
        <div key={media.id} className="mt-4">
          <div className="text-sm text-muted-foreground mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            {filename}
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-muted rounded-md text-sm font-medium hover:bg-muted/80"
          >
            <FileText className="h-4 w-4 mr-2" />
            Download File
          </a>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Question Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                {questionData.title ||
                  `Question ${question.sequenceNumber + 1}`}
              </CardTitle>
              {questionData.instructions && (
                <CardDescription className="mt-2">
                  {questionData.instructions}
                </CardDescription>
              )}
            </div>
            <Badge variant="outline">
              {questionData.questionType.display_name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {questionData.content && (
            <div
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: questionData.content }}
            />
          )}

          {/* Render question media */}
          {questionData.media
            .filter((m) => m.role === 'question_content')
            .sort((a, b) => a.display_order - b.display_order)
            .map(renderMedia)}
        </CardContent>
      </Card>

      {/* Recording Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Recording Interface</CardTitle>
          <CardDescription>
            Record your spoken response or type it out
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timer and Controls */}
            <div className="space-y-4">
              <div className="text-center p-6 border rounded-lg bg-muted/10">
                {isPreparationPhase ? (
                  <>
                    <div className="text-sm text-muted-foreground mb-2">
                      Preparation Time
                    </div>
                    <div className="text-3xl font-bold">
                      {formatTime(preparationTime)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Read the question carefully. You can start recording when
                      the preparation time ends.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground mb-2">
                      {isRecording ? 'Recording Time' : 'Recorded Time'}
                    </div>
                    <div className="text-3xl font-bold">
                      {formatTime(recordingTime)}
                    </div>
                    {!hasStartedRecording && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Click "Start Recording" and answer the question clearly.
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col items-center gap-3">
                {!isRecording && !audioUrl && !isPreparationPhase && (
                  <Button
                    onClick={startRecording}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                )}

                {isRecording && (
                  <Button
                    onClick={stopRecording}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                )}

                {audioUrl && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button
                      onClick={() => {
                        const audio = new Audio(audioUrl);
                        audio.play();
                      }}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play Recording
                    </Button>
                    <Button
                      onClick={resetRecording}
                      variant="outline"
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Re-record
                    </Button>
                  </div>
                )}

                {isPreparationPhase && (
                  <Button
                    onClick={() => setIsPreparationPhase(false)}
                    variant="outline"
                    className="w-full"
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Skip Preparation
                  </Button>
                )}
              </div>

              {isRecording && (
                <div className="flex items-center justify-center gap-2 text-red-500">
                  <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Recording...</span>
                </div>
              )}
            </div>

            {/* Text Response Alternative */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Text Response</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Type your spoken response here if you prefer not to record
                  audio.
                </p>
                <Textarea
                  value={textResponse}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Type your spoken response here..."
                  rows={8}
                  className="min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Press Ctrl+Enter to save your response
                </p>
              </div>

              {audioUrl && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Recorded Audio</span>
                  </div>
                  <audio controls src={audioUrl} className="w-full" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Audio recording is attached to this response
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={
            (!audioUrl && !textResponse.trim()) ||
            isPreparationPhase ||
            isSubmitting
          }
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Submit Answer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default SpeakingQuestion;
