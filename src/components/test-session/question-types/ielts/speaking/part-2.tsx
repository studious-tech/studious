'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  MicOff,
  Square,
  Play,
  RotateCcw,
  Timer,
  Clock,
  CheckCircle2,
  FileText,
  PenTool
} from 'lucide-react';
import { toast } from 'sonner';

interface QuestionData {
  id: string;
  title?: string;
  content?: string;
  instructions?: string;
  difficultyLevel: number;
  expectedDurationSeconds?: number;
  questionType: {
    displayName: string;
  };
}

interface TestSessionQuestion {
  question: QuestionData;
  sessionQuestionId: string;
  sequenceNumber: number;
}

interface ResponseData {
  questionId: string;
  sessionQuestionId: string;
  response: Blob;
  responseType: string;
}

interface IELTSSpeakingPart2Props {
  question: TestSessionQuestion;
  examId: string;
  onResponse: (response: ResponseData) => void;
}

export default function IELTSSpeakingPart2({
  question,
  onResponse,
}: IELTSSpeakingPart2Props) {
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes speaking
  const [preparationTime, setPreparationTime] = useState(60); // 1 minute prep
  const [isPreparationPhase, setIsPreparationPhase] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const preparationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const questionData = question.question;

  // Sample cue card content - in real implementation this would come from props
  const cueCardTopic = {
    title: "Describe a memorable journey you have taken",
    points: [
      "Where you went",
      "Who you went with",
      "What you did there",
      "And explain why this journey was memorable for you"
    ]
  };

  // Preparation phase countdown
  useEffect(() => {
    if (isPreparationPhase && preparationTime > 0 && hasStarted) {
      preparationTimerRef.current = setInterval(() => {
        setPreparationTime(prev => {
          if (prev <= 1) {
            setIsPreparationPhase(false);
            toast.info('Preparation time is up! You may start speaking now.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (preparationTimerRef.current) clearInterval(preparationTimerRef.current);
    };
  }, [isPreparationPhase, preparationTime, hasStarted]);

  // Recording timer
  useEffect(() => {
    if (isRecording && timeRemaining > 0) {
      recordingTimerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stopRecording();
            toast.info('Speaking time is up!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startPreparation = () => {
    setHasStarted(true);
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);

        onResponse({
          questionId: questionData.id,
          sessionQuestionId: question.sessionQuestionId,
          response: audioBlob,
          responseType: 'audio_recording',
        });

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTimeRemaining(120); // Reset to 2 minutes for speaking
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

  const resetRecording = () => {
    setAudioUrl(null);
    setIsRecording(false);
    setIsPreparationPhase(true);
    setPreparationTime(60);
    setTimeRemaining(120);
    setHasStarted(false);
    if (isRecording) {
      stopRecording();
    }
  };

  return (
    <div className="ielts-speaking-part-2 h-full bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Basic Header - Real IELTS Style */}
      <div className="bg-gray-100 border-b-2 border-gray-300 p-3">
        <div className="flex items-center justify-between">
          <div className="text-black text-base font-bold">IELTS Speaking Test - Part 2</div>
          <div className="text-black text-sm">Question {question.sequenceNumber}</div>
        </div>
      </div>

      {/* Simple Content Layout */}
      <div className="flex h-full">
        {/* Left Panel: Cue Card */}
        <div className="w-1/2 p-4 bg-white border-r border-gray-300 overflow-y-auto">
          <div className="space-y-4">
            {/* Simple Header */}
            <div className="border-b border-gray-300 pb-2">
              <h3 className="text-base font-bold text-black">Individual Long Turn</h3>
              <p className="text-sm text-gray-700">Part 2: Cue Card Task</p>
            </div>

            {/* Instructions Box */}
            {questionData.instructions && (
              <div className="border border-gray-400 p-3 bg-gray-50">
                <div className="text-sm text-black">
                  {questionData.instructions}
                </div>
              </div>
            )}

            {/* Basic Cue Card */}
            <div className="border-2 border-gray-400 p-4 bg-white">
              <div className="space-y-3">
                <h4 className="font-bold text-black text-sm">Topic Card</h4>

                <div className="bg-gray-100 border border-gray-300 p-4">
                  <h5 className="text-sm font-bold text-black mb-3">
                    {cueCardTopic.title}
                  </h5>

                  <p className="text-sm text-black mb-3 font-bold">You should say:</p>

                  <ul className="space-y-2">
                    {cueCardTopic.points.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-black font-bold">•</span>
                        <span className="text-black text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Basic Preparation Notes Area */}
            <div className="border border-gray-400 p-3 bg-gray-50">
              <h5 className="font-bold text-black text-sm mb-2">Preparation Notes</h5>
              <div className="bg-white min-h-[120px] p-3 border border-gray-300">
                <p className="text-sm text-gray-600">
                  Use this space to make notes during your 1-minute preparation time.
                  You can write key points, vocabulary, or structure your answer.
                </p>
              </div>
              <p className="text-xs text-black mt-2">
                Note: In the real exam, you'll be given paper and pencil for notes.
              </p>
            </div>

            {/* Basic Instructions */}
            <div className="border border-gray-400 p-3 bg-gray-50">
              <h4 className="font-bold text-black text-sm mb-2">IELTS Speaking Part 2:</h4>
              <ul className="text-xs text-black space-y-1 ml-4" style={{ listStyleType: 'disc' }}>
                <li>1 minute to prepare and make notes</li>
                <li>Speak for 1-2 minutes on the topic</li>
                <li>Cover all points mentioned on the cue card</li>
                <li>Organize your answer with clear structure</li>
                <li>Use a variety of vocabulary and grammar</li>
                <li>The examiner will stop you after 2 minutes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Panel: Basic Timer and Recording Interface */}
        <div className="w-1/2 p-4 bg-gray-50 overflow-y-auto">
          <div className="space-y-4">
            {/* Simple Phase Display */}
            {!hasStarted && (
              <div className="border border-gray-400 p-4 bg-white">
                <div className="text-center space-y-3">
                  <h3 className="text-base font-bold text-black">Ready to Begin Part 2?</h3>
                  <p className="text-sm text-black">
                    You will have 1 minute to prepare and make notes, then speak for up to 2 minutes.
                  </p>
                  <button
                    onClick={startPreparation}
                    className="bg-gray-200 border-2 border-gray-400 px-6 py-2 text-sm font-bold text-black hover:bg-gray-300"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    Start Preparation Time
                  </button>
                </div>
              </div>
            )}

            {/* Basic Timer Display */}
            {hasStarted && (
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
                        Read the topic card and make notes. Think about how you'll structure your answer.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-black font-bold">
                        Speaking Time
                      </div>
                      <div className={`text-2xl font-bold ${timeRemaining < 30 ? 'text-red-600' : 'text-black'}`}>
                        {formatTime(timeRemaining)}
                      </div>
                      {!isRecording && !audioUrl && (
                        <p className="text-xs text-black">
                          Click "Start Speaking" and talk about the topic for 1-2 minutes.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Basic Recording Status */}
            <div className="border border-gray-400 p-4 bg-white">
              <div className="text-center space-y-3">
                {/* Simple Status Text */}
                <div className="text-sm text-black font-bold">
                  {isRecording ? (
                    <span className="bg-red-100 border border-red-300 px-3 py-1">
                      ● Recording Answer
                    </span>
                  ) : audioUrl ? (
                    <span className="bg-green-100 border border-green-300 px-3 py-1">
                      ✓ Answer Recorded
                    </span>
                  ) : (
                    <span className="bg-gray-100 border border-gray-300 px-3 py-1">
                      {isPreparationPhase ? 'Preparing' : 'Ready to Speak'}
                    </span>
                  )}
                </div>

                {/* Basic Control Buttons */}
                <div className="space-y-2">
                  {!isRecording && !audioUrl && !isPreparationPhase && (
                    <button
                      onClick={startRecording}
                      className="bg-red-200 border-2 border-red-400 px-6 py-2 text-sm font-bold text-black hover:bg-red-300"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      Start Speaking
                    </button>
                  )}

                  {isRecording && (
                    <button
                      onClick={stopRecording}
                      className="bg-red-300 border-2 border-red-500 px-6 py-2 text-sm font-bold text-black hover:bg-red-400"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      Stop Recording
                    </button>
                  )}

                  {audioUrl && (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          const audio = new Audio(audioUrl);
                          audio.play();
                        }}
                        className="bg-gray-200 border border-gray-400 px-4 py-2 text-sm font-bold text-black hover:bg-gray-300 mr-2"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        Play Answer
                      </button>
                      <button
                        onClick={resetRecording}
                        className="bg-gray-200 border border-gray-400 px-4 py-2 text-sm font-bold text-black hover:bg-gray-300"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        Re-record
                      </button>
                    </div>
                  )}
                </div>

                {isPreparationPhase && (
                  <p className="text-xs text-gray-600">
                    Read the topic and make notes. Speaking will begin when preparation time ends.
                  </p>
                )}
              </div>
            </div>

            {/* Basic Test Info */}
            <div className="border border-gray-400 p-3 bg-white">
              <h5 className="text-sm font-bold text-black mb-2">Test Details</h5>
              <div className="text-xs text-black space-y-1">
                <div>Type: {questionData.questionType.displayName}</div>
                <div>Preparation: 1 minute</div>
                <div>Speaking: 1-2 minutes</div>
                <div>Current Phase: {isPreparationPhase ? 'Preparation' : 'Speaking'}</div>
                <div>Status: {hasStarted ? 'In progress' : 'Not started'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}