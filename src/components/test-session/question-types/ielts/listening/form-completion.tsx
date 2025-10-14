'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Headphones,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Media {
  id: string;
  filename: string;
  fileType: string;
  url: string;
  durationSeconds?: number;
}

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
  media: Array<{
    id: string;
    role: string;
    media: Media;
  }>;
}

interface TestSessionQuestion {
  question: QuestionData;
  sessionQuestionId: string;
  sequenceNumber: number;
}

interface ResponseData {
  questionId: string;
  sessionQuestionId: string;
  response: Record<string, string>;
  responseType: string;
}

interface IELTSListeningFormCompletionProps {
  question: TestSessionQuestion;
  examId: string;
  onResponse: (response: ResponseData) => void;
}

export default function IELTSListeningFormCompletion({
  question,
  onResponse,
}: IELTSListeningFormCompletionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const questionData = question.question;
  const audioMedia = questionData.media?.find(m => m.media.fileType === 'audio')?.media;

  // Sample form fields - in real implementation this would come from props
  const formFields = [
    { id: '1', label: 'Name', placeholder: 'Enter the name mentioned' },
    { id: '2', label: 'Phone Number', placeholder: 'Enter the phone number' },
    { id: '3', label: 'Address', placeholder: 'Enter the address' },
    { id: '4', label: 'Date', placeholder: 'Enter the date mentioned' },
    { id: '5', label: 'Time', placeholder: 'Enter the time mentioned' },
    { id: '6', label: 'Price/Cost', placeholder: 'Enter the price or cost' },
    { id: '7', label: 'Reason', placeholder: 'Enter the reason given' },
    { id: '8', label: 'Location', placeholder: 'Enter the location mentioned' },
  ];

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioMedia]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (!hasStarted) {
      setHasStarted(true);
      toast.info('Listening section has started. You can replay the audio twice.');
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const resetAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number) => {
    if (!audioRef.current) return;
    const newVolume = value / 100;
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const handleAnswerChange = (fieldId: string, value: string) => {
    const newAnswers = { ...answers, [fieldId]: value };
    setAnswers(newAnswers);

    onResponse({
      questionId: questionData.id,
      sessionQuestionId: question.sessionQuestionId,
      response: newAnswers,
      responseType: 'form_completion',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletionStatus = () => {
    const filledFields = Object.values(answers).filter(value => value.trim().length > 0).length;
    return `${filledFields}/${formFields.length} completed`;
  };

  return (
    <div className="ielts-listening-form-completion h-full bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Basic Header - Real IELTS Style */}
      <div className="bg-gray-100 border-b-2 border-gray-300 p-3">
        <div className="flex items-center justify-between">
          <div className="text-black text-base font-bold">IELTS Listening - Form Completion</div>
          <div className="text-black text-sm">Question {question.sequenceNumber}</div>
        </div>
      </div>

      {/* Simple Content Layout */}
      <div className="flex h-full">
        {/* Left Panel: Instructions and Audio Controls */}
        <div className="w-1/2 p-4 bg-white border-r border-gray-300 overflow-y-auto">
          <div className="space-y-4">
            {/* Simple Header */}
            <div className="border-b border-gray-300 pb-2">
              <h3 className="text-base font-bold text-black">Listen and Complete</h3>
              <p className="text-sm text-gray-700">Form Completion Task</p>
            </div>

            {/* Instructions Box */}
            {questionData.instructions && (
              <div className="border border-gray-400 p-3 bg-gray-50">
                <div className="text-sm text-black">
                  {questionData.instructions}
                </div>
              </div>
            )}

            {/* Basic Audio Player */}
            {audioMedia && (
              <div className="border-2 border-gray-400 p-4 bg-white">
                <div className="space-y-3">
                  <h4 className="font-bold text-black text-sm">Audio Player</h4>

                  <audio
                    ref={audioRef}
                    src={audioMedia.url}
                    preload="metadata"
                  />

                  {/* Basic Audio Controls */}
                  <div className="space-y-3">
                    {/* Simple Play/Pause Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePlayPause}
                        className="bg-gray-200 border border-gray-400 px-4 py-2 text-sm font-bold text-black hover:bg-gray-300"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                        disabled={!audioMedia.url}
                      >
                        {isPlaying ? 'Pause' : 'Play'}
                      </button>

                      <button
                        onClick={resetAudio}
                        className="bg-gray-200 border border-gray-400 px-4 py-2 text-sm font-bold text-black hover:bg-gray-300"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        Restart
                      </button>

                      <button
                        onClick={toggleMute}
                        className="bg-gray-200 border border-gray-400 px-2 py-2 text-sm font-bold text-black hover:bg-gray-300"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        {isMuted ? '🔇' : '🔊'}
                      </button>
                    </div>

                    {/* Basic Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-black">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <div className="w-full bg-gray-300 border border-gray-400 h-3">
                        <div
                          className="bg-gray-600 h-3"
                          style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>

                    {/* Basic Volume Control */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-black font-bold">Volume:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume * 100}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        className="flex-1"
                      />
                    </div>

                    {!hasStarted && (
                      <div className="text-xs text-black bg-gray-100 border border-gray-300 p-2">
                        Click Play to start the listening section. You can replay the audio up to 2 times.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Basic Instructions */}
            <div className="border border-gray-400 p-3 bg-gray-50">
              <h4 className="font-bold text-black text-sm mb-2">Instructions:</h4>
              <ul className="text-xs text-black space-y-1 ml-4" style={{ listStyleType: 'disc' }}>
                <li>Listen to the recording and complete the form</li>
                <li>Write NO MORE THAN TWO WORDS for each answer</li>
                <li>You will hear the recording only once in the real exam</li>
                <li>Write your answers clearly in the spaces provided</li>
                <li>Check spelling and grammar carefully</li>
                <li>Transfer answers to the answer sheet at the end</li>
              </ul>
            </div>

            {/* Basic Listening Tips */}
            <div className="border border-gray-400 p-3 bg-gray-50">
              <h4 className="font-bold text-black text-sm mb-2">Listening Tips:</h4>
              <ul className="text-xs text-black space-y-1 ml-4" style={{ listStyleType: 'disc' }}>
                <li>Read the form before listening</li>
                <li>Predict what type of information is needed</li>
                <li>Listen for specific details like names, numbers, dates</li>
                <li>Pay attention to spelling when names are spelled out</li>
                <li>Write exactly what you hear</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Panel: Basic Form to Complete */}
        <div className="w-1/2 p-4 bg-gray-50 overflow-y-auto">
          <div className="space-y-4">
            {/* Simple Completion Status */}
            <div className="border border-gray-400 p-3 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-black">Complete the Form</h3>
                <span className="text-xs text-gray-600 border border-gray-400 px-2 py-1">
                  {getCompletionStatus()}
                </span>
              </div>
            </div>

            {/* Basic Form Fields */}
            <div className="border-2 border-gray-400 p-4 bg-white">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-black mb-3 border-b border-gray-300 pb-1">
                  Application Form
                </h4>

                <div className="space-y-3">
                  {formFields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-black">
                          {field.id}. {field.label}:
                        </label>
                        {answers[field.id] && answers[field.id].trim() && (
                          <span className="text-xs text-green-600">✓</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={answers[field.id] || ''}
                        onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full p-2 text-sm text-black border-2 border-gray-400 focus:outline-none focus:border-gray-600"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Basic Word Limit Reminder */}
            <div className="border border-gray-400 p-3 bg-yellow-50">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">⚠</span>
                <div>
                  <h5 className="font-bold text-black text-sm">Remember:</h5>
                  <p className="text-xs text-black mt-1">
                    Write NO MORE THAN TWO WORDS for each answer.
                    Numbers can be written as figures or words.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Question Info */}
            <div className="border border-gray-400 p-3 bg-white">
              <h5 className="text-sm font-bold text-black mb-2">Question Details</h5>
              <div className="text-xs text-black space-y-1">
                <div>Type: {questionData.questionType.displayName}</div>
                <div>Fields to complete: {formFields.length}</div>
                <div>Word limit: 2 words maximum per answer</div>
                <div>Audio available: {audioMedia ? 'Yes' : 'No'}</div>
                <div>Status: {hasStarted ? 'In progress' : 'Not started'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}