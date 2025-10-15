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

interface PTESpeakingRepeatSentenceProps {
  question: TestSessionQuestion;
  onResponse: (response: ResponseData) => void;
  preparationSeconds?: number;
  speakingSeconds?: number;
}

export default function PTESpeakingRepeatSentence({
  question,
  onResponse,
  preparationSeconds = 3,
  speakingSeconds = 15,
}: PTESpeakingRepeatSentenceProps) {
  const [sentenceAudioEnded, setSentenceAudioEnded] = useState(false);

  const questionData = question.question;
  const audioMedia = questionData.media?.find(
    (m) => m.media.fileType === 'audio'
  )?.media;
  const sentenceAudioUrl = audioMedia?.id ? getMediaUrl(audioMedia.id) : null;

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
            `You will hear a sentence. Please repeat the sentence exactly as you hear it.`}
        </p>
      </div>

      {/* Sentence Audio Player */}
      {sentenceAudioUrl && (
        <div className="max-w-[800px] mx-auto mb-8">
          <AudioPlayer
            audioUrl={sentenceAudioUrl}
            variant="full"
            title="Sentence Audio"
            onEnded={() => setSentenceAudioEnded(true)}
            maxPlays={1}
          />
        </div>
      )}

      {/* Audio Recorder - Shows after sentence audio ends */}
      {sentenceAudioEnded && (
        <div className="max-w-[800px] mx-auto mt-6">
          <AudioRecorder
            preparationSeconds={preparationSeconds}
            recordingSeconds={speakingSeconds}
            onRecordingComplete={handleRecordingComplete}
            showPhaseIndicator={true}
            title="Your Response"
            autoStartPreparation={true}
          />
        </div>
      )}
    </div>
  );
}
