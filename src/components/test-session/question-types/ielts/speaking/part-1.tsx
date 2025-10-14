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
import { Input } from '@/components/ui/input';
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

interface IELTSSpeakingPart1Props {
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

export function IELTSSpeakingPart1({
  question,
  examId,
  onResponse,
  onSubmit,
  currentResponse,
}: IELTSSpeakingPart1Props) {
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
    }
  };

  return (
    <div
      className="ielts-speaking-part-1 h-full bg-white"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Basic Header - Real IELTS Style */}
      <div className="bg-gray-100 border-b-2 border-gray-300 p-3">
        <div className="flex items-center justify-between">
          <div className="text-black text-base font-bold">
            IELTS Speaking: Part 1
          </div>
          <div className="text-black text-sm">
            Question {question.sequenceNumber + 1}
          </div>
        </div>
      </div>

      {/* Simple Content Layout */}
      <div className="flex h-full">
        {/* Left Panel: Introduction and Topics */}
        <div className="w-1/2 p-4 bg-white border-r border-gray-300 overflow-y-auto">
          <div className="space-y-4">
            {/* Simple Header */}
            <div className="border-b border-gray-300 pb-2">
              <h3 className="text-base font-bold text-black">
                Introduction & Interview
              </h3>
              <p className="text-sm text-gray-700">
                Answer personal questions about familiar topics
              </p>
            </div>

            {/* Instructions Box */}
            {questionData.instructions && (
              <div className="border border-gray-400 p-3 bg-gray-50">
                <div className="text-sm text-black">
                  {questionData.instructions}
                </div>
              </div>
            )}

            {/* Topic Areas */}
            <div className="border-2 border-gray-400 p-4 bg-white">
              <div className="space-y-3">
                <h4 className="font-bold text-black text-sm">Common Topics</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-gray-300 p-2 text-center text-xs bg-gray-50">
                    Hometown
                  </div>
                  <div className="border border-gray-300 p-2 text-center text-xs bg-gray-50">
                    Accommodation
                  </div>
                  <div className="border border-gray-300 p-2 text-center text-xs bg-gray-50">
                    Work/Study
                  </div>
                  <div className="border border-gray-300 p-2 text-center text-xs bg-gray-50">
                    Free Time
                  </div>
                  <div className="border border-gray-300 p-2 text-center text-xs bg-gray-50">
                    Family
                  </div>
                  <div className="border border-gray-300 p-2 text-center text-xs bg-gray-50">
                    Food
                  </div>
                </div>

                <div className="text-sm text-black border-t border-gray-300 pt-3">
                  <p className="font-bold mb-1">Sample Questions:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>What's your hometown?</li>
                    <li>Do you live in a house or an apartment?</li>
                    <li>What do you like most about your hometown?</li>
                    <li>What's your favorite food?</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Basic Task Requirements */}
            <div className="border border-gray-400 p-3 bg-gray-50">
              <h4 className="font-bold text-black text-sm mb-2">
                Task Requirements:
              </h4>
              <ul
                className="text-xs text-black space-y-1 ml-4"
                style={{ listStyleType: 'disc' }}
              >
                <li>Answer naturally and fluently</li>
                <li>Provide full, detailed responses</li>
                <li>Give reasons and examples where appropriate</li>
                <li>Speak clearly and at a natural pace</li>
                <li>Listen carefully and respond appropriately</li>
                <li>Maintain eye contact with the examiner</li>
                <li>Show enthusiasm and engagement</li>
                <li>Complete in approximately 4-5 minutes</li>
              </ul>
            </div>

            {/* Basic Useful Phrases */}
            <div className="border border-gray-400 p-3 bg-gray-50">
              <h4 className="font-bold text-black text-sm mb-2">
                Useful Phrases:
              </h4>
              <div className="text-xs text-black space-y-1">
                <div>
                  <strong>Introductions:</strong> Well, I'm from..., I currently
                  live in...
                </div>
                <div>
                  <strong>Expanding:</strong> That's because..., The reason
                  is..., For example...
                </div>
                <div>
                  <strong>Clarifying:</strong> What I mean is..., In other
                  words...
                </div>
                <div>
                  <strong>Transitions:</strong> Moving on..., Another thing...,
                  Additionally...
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Recording Interface */}
        <div className="w-1/2 p-4 bg-gray-50 overflow-y-auto">
          <div className="space-y-4">
            {/* Basic Timer Display */}
            <div className="border border-gray-400 p-3 bg-white">
              <div className="text-center space-y-3">
                {isPreparationPhase ? (
                  <>
                    <div className="text-sm text-black font-bold">
                      Preparation Time
                    </div>
                    <div className="text-2xl font-bold text-black">
                      {formatTime(preparationTime)}
                    </div>
                    <p className="text-xs text-black">
                      Read the question carefully. You can start recording when
                      the preparation time ends.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-black font-bold">
                      Recording Time
                    </div>
                    <div className="text-2xl font-bold text-black">
                      {formatTime(recordingTime)}
                    </div>
                    {!hasStartedRecording && (
                      <p className="text-xs text-black">
                        Click "Start Recording" and answer the question clearly.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Basic Recording Status */}
            <div className="border border-gray-400 p-4 bg-white">
              <div className="text-center space-y-3">
                {/* Simple Status Text */}
                <div className="text-sm text-black font-bold">
                  {isRecording ? (
                    <span className="bg-red-100 border border-red-300 px-3 py-1">
                      ● Recording
                    </span>
                  ) : audioUrl ? (
                    <span className="bg-green-100 border border-green-300 px-3 py-1">
                      ✓ Recording Complete
                    </span>
                  ) : (
                    <span className="bg-gray-100 border border-gray-300 px-3 py-1">
                      {isPreparationPhase ? 'Preparing' : 'Ready to Record'}
                    </span>
                  )}
                </div>

                {/* Basic Control Buttons */}
                <div className="space-y-2">
                  {!isRecording && !audioUrl && !isPreparationPhase && (
                    <Button
                      onClick={startRecording}
                      className="bg-red-200 border-2 border-red-400 px-6 py-2 text-sm font-bold text-black hover:bg-red-300"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  )}

                  {isRecording && (
                    <Button
                      onClick={stopRecording}
                      className="bg-red-300 border-2 border-red-500 px-6 py-2 text-sm font-bold text-black hover:bg-red-400"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}

                  {audioUrl && (
                    <div className="space-y-2">
                      <Button
                        onClick={() => {
                          const audio = new Audio(audioUrl);
                          audio.play();
                        }}
                        className="bg-gray-200 border border-gray-400 px-4 py-2 text-sm font-bold text-black hover:bg-gray-300 mr-2"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play Recording
                      </Button>
                      <Button
                        onClick={resetRecording}
                        className="bg-gray-200 border border-gray-400 px-4 py-2 text-sm font-bold text-black hover:bg-gray-300"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Re-record
                      </Button>
                    </div>
                  )}
                </div>

                {isPreparationPhase && (
                  <p className="text-xs text-gray-600">
                    Prepare your thoughts. Recording will begin when preparation
                    time ends.
                  </p>
                )}
              </div>
            </div>

            {/* Text Response Alternative */}
            <div className="border border-gray-400 p-4 bg-white">
              <h4 className="font-bold text-black text-sm mb-2">
                Text Response (Alternative)
              </h4>
              <Textarea
                placeholder="Type your spoken response here if you prefer not to record..."
                value={textResponse}
                onChange={(e) => handleTextChange(e.target.value)}
                className="min-h-[120px] text-sm"
              />
              <p className="text-xs text-gray-600 mt-2">
                Use this if you cannot record audio or prefer to type your
                response.
              </p>
            </div>

            {/* Submit Button */}
            <div className="border border-gray-400 p-4 bg-white">
              <Button
                onClick={handleSubmit}
                disabled={!audioUrl && !textResponse.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit Answer
              </Button>
            </div>

            {/* Basic Question Details */}
            <div className="border border-gray-400 p-3 bg-white">
              <h5 className="font-bold text-black text-sm mb-2">
                Question Details
              </h5>
              <div className="text-xs text-black space-y-1">
                <div>Type: {questionData.questionType.display_name}</div>
                <div>Preparation: 30 seconds</div>
                <div>Recording: Up to 2 minutes</div>
                <div>
                  Status:{' '}
                  {audioUrl || textResponse.trim()
                    ? 'Completed'
                    : isPreparationPhase
                    ? 'Preparing'
                    : 'Recording'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IELTSSpeakingPart1;
