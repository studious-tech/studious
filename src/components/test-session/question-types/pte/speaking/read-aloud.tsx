'use client';

import { useCallback } from 'react';
import { AudioRecorder } from '@/components/test-session/audio/AudioRecorder';

interface Media {
  id: string;
  filename: string;
  fileType: string;
  url: string;
  dimensions?: { width: number; height: number };
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
  response: Blob;
  responseType: string;
}

interface PTESpeakingRetellLectureProps {
  question: TestSessionQuestion;
  onResponse: (response: ResponseData) => void;
  preparationSeconds?: number;
  speakingSeconds?: number;
}

export default function PTESpeakingReadAloud({
  question,
  onResponse,
  preparationSeconds = 35,
  speakingSeconds = 40,
}: PTESpeakingRetellLectureProps) {
  const questionData = question.question;

  const handleRecordingComplete = useCallback(
    (blob: Blob) => {
      onResponse({
        questionId: questionData.id,
        sessionQuestionId: question.sessionQuestionId,
        response: blob,
        responseType: 'audio_recording',
      });
    },
    [questionData.id, question.sessionQuestionId, onResponse]
  );

  return (
    <div className="w-full p-5 font-sans text-[#071029] box-border">
      {/* Instruction */}
      <div className="max-w-[80%] pl-1.5 mt-8 mb-6">
        <p className="m-0 text-[15px] italic leading-tight">
          {questionData.instructions ||
            `You will have ${preparationSeconds} seconds to prepare your response, then ${speakingSeconds} seconds to read the text aloud.`}
        </p>
      </div>

      {/* Audio Recorder */}
      <div className="max-w-[800px] mx-auto mt-4 mb-8">
        <AudioRecorder
          preparationSeconds={preparationSeconds}
          recordingSeconds={speakingSeconds}
          onRecordingComplete={handleRecordingComplete}
          showPhaseIndicator={true}
          title="Audio Recorder"
          autoStartPreparation={true}
        />
      </div>

      {/* Text Passage */}
      <div className="mt-12 w-full">
        <p className="text-xl leading-relaxed font-serif text-slate-900 m-0 text-left pl-1.5">
          {questionData.content || 'No content available for this question.'}
        </p>
      </div>
    </div>
  );
}
