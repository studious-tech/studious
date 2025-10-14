'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface QuestionData {
  id: string;
  title?: string;
  content?: string;
  instructions?: string;
  difficultyLevel: number;
  expectedDurationSeconds?: number;
  questionType: { displayName: string };
}

interface TestSessionQuestion {
  question: QuestionData;
  sessionQuestionId: string;
  sequenceNumber: number;
}

interface ResponseData {
  questionId: string;
  sessionQuestionId: string;
  response: string;
  responseType: string;
}

interface PTEWritingWriteEssayProps {
  question: TestSessionQuestion;
  examId?: string;
  onResponse: (response: ResponseData) => void;
}

export default function PTEWritingWriteEssay({
  question,
  onResponse,
}: PTEWritingWriteEssayProps) {
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const minWords = 200;
  const maxWords = 300;
  const questionData = question.question;
  const essayRef = useRef(essay);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep ref updated with latest essay
  useEffect(() => {
    essayRef.current = essay;
  }, [essay]);

  // Debounced save function
  const saveResponseDebounced = useCallback(
    (text: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        if (text.trim()) {
          onResponse({
            questionId: questionData.id,
            sessionQuestionId: question.sessionQuestionId,
            response: text,
            responseType: 'text_response',
          });
        }
      }, 1000); // 1 second debounce
    },
    [onResponse, questionData.id, question.sessionQuestionId]
  );

  // Cleanup on unmount - ensure final response is saved
  useEffect(() => {
    return () => {
      // Clear any pending debounced save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Save final state on unmount if there's any text
      const finalText = essayRef.current;
      if (finalText.trim()) {
        onResponse({
          questionId: questionData.id,
          sessionQuestionId: question.sessionQuestionId,
          response: finalText,
          responseType: 'text_response',
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countWords = (text: string) =>
    text.replace(/\n/g, ' ').trim().split(/\s+/).filter(Boolean).length;

  const handleTextChange = (text: string) => {
    setEssay(text);
    const c = countWords(text);
    setWordCount(c);
    saveResponseDebounced(text);
  };

  const handleCopy = async () => {
    try {
      const textarea = textRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = essay.substring(start, end);

      if (selectedText) {
        await navigator.clipboard.writeText(selectedText);
        toast.success('Copied');
      } else {
        toast.info('No text selected');
      }
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleCut = async () => {
    try {
      const textarea = textRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = essay.substring(start, end);

      if (selectedText) {
        await navigator.clipboard.writeText(selectedText);
        const newText = essay.substring(0, start) + essay.substring(end);
        handleTextChange(newText);

        // Restore cursor position
        setTimeout(() => {
          textarea.setSelectionRange(start, start);
          textarea.focus();
        }, 0);

        toast.success('Cut');
      } else {
        toast.info('No text selected');
      }
    } catch {
      toast.error('Cut failed');
    }
  };

  const handlePaste = async () => {
    try {
      const textarea = textRef.current;
      if (!textarea) return;

      const text = await navigator.clipboard.readText();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newText = essay.substring(0, start) + text + essay.substring(end);

      handleTextChange(newText);

      // Restore cursor position after pasted text
      setTimeout(() => {
        const newPosition = start + text.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }, 0);

      toast.success('Pasted');
    } catch {
      toast.error('Paste failed');
    }
  };

  return (
    <div className="bg-[#f5f7fa] font-sans text-gray-900 text-[13px] p-6">
      {/* Instructions */}
      <div className="border-b border-[#c8d1dc] pb-4 mb-6 max-w-6xl mx-auto">
        <p className="italic text-[14px] leading-relaxed text-gray-700 font-semibold">
          {questionData.instructions ||
            'You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your ideas, present supporting details, and control the elements of standard written English. You should write 200-300 words.'}
        </p>
      </div>

      {/* Question content */}
      <div className="mb-6 max-w-6xl mx-auto">
        <div className="text-[14px] leading-relaxed text-gray-800">
          {questionData.content ||
            'Violence portrayed on TV and in the movies leads to an increase in crime in our society. Do you agree or disagree?'}
        </div>
      </div>

      {/* Writing Area */}
      <div className="max-w-6xl mx-auto border border-[#c8d1dc] bg-white shadow-sm rounded">
        {/* Toolbar */}
        <div className="flex items-center border-b border-[#c8d1dc] bg-[#e9edf2]">
          <button
            onClick={handleCopy}
            className="px-4 py-1.5 text-[12px] font-medium border-r border-[#c8d1dc] hover:bg-[#dde2e8]"
          >
            Copy
          </button>
          <button
            onClick={handleCut}
            className="px-4 py-1.5 text-[12px] font-medium border-r border-[#c8d1dc] hover:bg-[#dde2e8]"
          >
            Cut
          </button>
          <button
            onClick={handlePaste}
            className="px-4 py-1.5 text-[12px] font-medium hover:bg-[#dde2e8]"
          >
            Paste
          </button>
          <div className="ml-auto pr-4 text-[12px] text-gray-700">
            {wordCount} / {maxWords} Word Limit
          </div>
        </div>

        {/* Text Area */}
        <Textarea
          ref={textRef}
          value={essay}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full h-[400px] resize-y border-none outline-none p-4 text-[15px] font-[Arial] leading-[1.6] text-gray-900 focus:ring-0 focus-visible:ring-0"
          placeholder="Type your essay here..."
        />
      </div>

      {/* Word count status */}
      <div className="max-w-6xl mx-auto mt-3">
        <div className="text-sm text-gray-600">
          {wordCount < minWords && (
            <span className="text-red-600 font-medium">
              Need {minWords - wordCount} more word
              {minWords - wordCount > 1 ? 's' : ''}
            </span>
          )}
          {wordCount >= minWords && wordCount <= maxWords && (
            <span className="text-green-600 font-medium">Good length</span>
          )}
          {wordCount > maxWords && (
            <span className="text-orange-600 font-medium">
              Reduce by {wordCount - maxWords} word
              {wordCount - maxWords > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
