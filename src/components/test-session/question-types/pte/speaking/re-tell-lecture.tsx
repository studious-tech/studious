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

export default function PTESpeakingRetellLecture({
  question,
  onResponse,
  preparationSeconds = 10,
  speakingSeconds = 40,
}: PTESpeakingRetellLectureProps) {
  const [lectureAudioEnded, setLectureAudioEnded] = useState(false);

  const questionData = question.question;
  const audioMedia = questionData.media?.find(
    (m) => m.media.fileType === 'audio'
  )?.media;
  const lectureAudioUrl = audioMedia?.id ? getMediaUrl(audioMedia.id) : null;

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
            `You will hear a lecture. You will have ${preparationSeconds} seconds to prepare your response, then ${speakingSeconds} seconds to retell what you heard.`}
        </p>
      </div>

      {/* Lecture Audio Player */}
      {lectureAudioUrl && (
        <div className="max-w-[800px] mx-auto mb-8">
          <AudioPlayer
            audioUrl={lectureAudioUrl}
            variant="full"
            title="Lecture Audio"
            onEnded={() => setLectureAudioEnded(true)}
            maxPlays={1}
          />
        </div>
      )}

      {/* Audio Recorder - Shows after lecture audio ends */}
      {lectureAudioEnded && (
        <div className="max-w-[800px] mx-auto mt-6">
          <AudioRecorder
            preparationSeconds={preparationSeconds}
            recordingSeconds={speakingSeconds}
            onRecordingComplete={handleRecordingComplete}
            showPhaseIndicator={true}
            title="Retell the Lecture"
            autoStartPreparation={true}
          />
        </div>
      )}
    </div>
  );
}
