'use client';

import { useCallback } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { getMediaUrl } from '@/lib/media-utils';
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

interface PTESpeakingDescribeImageProps {
  question: TestSessionQuestion;
  onResponse: (response: ResponseData) => void;
  preparationSeconds?: number;
  speakingSeconds?: number;
}

export default function PTESpeakingDescribeImage({
  question,
  onResponse,
  preparationSeconds = 25,
  speakingSeconds = 40,
}: PTESpeakingDescribeImageProps) {
  const questionData = question.question;
  const imageMedia = questionData.media?.find(
    (m) => m.media.fileType === 'image'
  )?.media;
  const imageUrl = imageMedia?.id ? getMediaUrl(imageMedia.id) : null;

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
      <div className="max-w-[80%] pl-1.5 mt-6 mb-4">
        <p className="m-0 text-[15px] italic leading-tight">
          {questionData.instructions ||
            `Look at the image. Prepare for ${preparationSeconds} seconds, then describe it in ${speakingSeconds} seconds.`}
        </p>
      </div>

      <div className="flex gap-7 mt-4">
        {/* Left: Image */}
        <div className="flex-1 max-w-[62%] bg-white">
          <div className="font-bold text-xl mb-3 text-center">
            {questionData.title || 'Figure'}
          </div>
          <div>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Question"
                className="w-full h-auto block"
              />
            ) : (
              <div className="h-[360px] flex flex-col items-center justify-center bg-slate-50 rounded-md border border-dashed border-gray-100 text-gray-600">
                <ImageIcon size={56} />
                <div className="mt-2">No image provided</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Audio Recorder */}
        <div className="w-[520px] flex-shrink-0">
          <AudioRecorder
            preparationSeconds={preparationSeconds}
            recordingSeconds={speakingSeconds}
            onRecordingComplete={handleRecordingComplete}
            showPhaseIndicator={true}
            title="Audio Recorder"
            autoStartPreparation={true}
          />
        </div>
      </div>
    </div>
  );
}
