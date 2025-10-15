'use client';

import { useCallback, useState } from 'react';
import { getMediaUrl } from '@/lib/media-utils';
import { AudioPlayer } from '@/components/test-session/audio/AudioPlayer';
import { AudioRecorder } from '@/components/test-session/audio/AudioRecorder';

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
  response: Blob;
  responseType: string;
}

interface PTESpeakingAnswerShortQuestionProps {
  question: TestSessionQuestion;
  onResponse: (response: ResponseData) => void;
  preparationSeconds?: number;
  speakingSeconds?: number;
}

export default function PTESpeakingAnswerShortQuestion({
  question,
  onResponse,
  preparationSeconds = 3,
  speakingSeconds = 10,
}: PTESpeakingAnswerShortQuestionProps) {
  const [questionAudioEnded, setQuestionAudioEnded] = useState(false);

  const questionData = question.question;
  const audioMedia = questionData.media?.find(
    (m) => m.media.fileType === 'audio'
  )?.media;
  const questionAudioUrl = audioMedia?.id ? getMediaUrl(audioMedia.id) : null;

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
            `You will hear a question. After the question, you have ${preparationSeconds} seconds to prepare and ${speakingSeconds} seconds to record your answer.`}
        </p>
      </div>

      {/* Question Audio Player */}
      {questionAudioUrl && (
        <div className="max-w-[800px] mx-auto mb-8">
          <AudioPlayer
            audioUrl={questionAudioUrl}
            variant="full"
            title="Question Audio"
            onEnded={() => setQuestionAudioEnded(true)}
            maxPlays={1}
          />
        </div>
      )}

      {/* Text Question (if no audio) */}
      {!questionAudioUrl && questionData.content && (
        <div className="max-w-[800px] mx-auto mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-lg leading-relaxed text-slate-900 m-0">
            {questionData.content}
          </p>
        </div>
      )}

      {/* Audio Recorder - Shows after question audio ends */}
      {(questionAudioEnded || !questionAudioUrl) && (
        <div className="max-w-[800px] mx-auto mt-6">
          <AudioRecorder
            preparationSeconds={preparationSeconds}
            recordingSeconds={speakingSeconds}
            onRecordingComplete={handleRecordingComplete}
            showPhaseIndicator={true}
            title="Your Answer"
            autoStartPreparation={true}
          />
        </div>
      )}
    </div>
  );
}
