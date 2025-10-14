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

interface PTEWritingSummarizeWrittenTextProps {
  question: TestSessionQuestion;
  examId?: string;
  onResponse: (response: ResponseData) => void;
}

export default function PTEWritingSummarizeWrittenText({
  question,
  onResponse,
}: PTEWritingSummarizeWrittenTextProps) {
  const [summary, setSummary] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  // Summarize task: 25 - 50 words (matching screenshot)
  const minWords = 25;
  const maxWords = 50;

  const questionData = question.question;
  const summaryRef = useRef(summary);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep ref updated with latest summary
  useEffect(() => {
    summaryRef.current = summary;
  }, [summary]);

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
      const finalText = summaryRef.current;
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

  // simple, robust word counter
  const countWords = (text: string) =>
    text.replace(/\n/g, ' ').trim().split(/\s+/).filter(Boolean).length;

  // on change -> local state + debounced autosave
  const handleTextChange = (text: string) => {
    setSummary(text);
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
      const selectedText = summary.substring(start, end);

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
      const selectedText = summary.substring(start, end);

      if (selectedText) {
        await navigator.clipboard.writeText(selectedText);
        const newText = summary.substring(0, start) + summary.substring(end);
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

      const newText =
        summary.substring(0, start) + text + summary.substring(end);

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

  // small helpers for word count status style & text
  const wordColorClass = () => {
    if (wordCount < minWords) return 'text-red-600';
    if (wordCount > maxWords) return 'text-red-600';
    if (wordCount >= maxWords - 5) return 'text-orange-600';
    return 'text-green-600';
  };

  const wordStatusText = () => {
    if (wordCount < minWords)
      return `Need ${minWords - wordCount} more word${
        minWords - wordCount > 1 ? 's' : ''
      }`;
    if (wordCount > maxWords)
      return `Reduce by ${wordCount - maxWords} word${
        wordCount - maxWords > 1 ? 's' : ''
      }`;
    return 'Good length';
  };

  return (
    <div className="bg-[#f5f7fa] font-sans text-gray-900 text-[13px] p-6">
      {/* Instructions area */}
      <div className="border-b border-[#c8d1dc] pb-4 mb-6 max-w-6xl mx-auto">
        <p className="italic text-[14px] leading-relaxed text-gray-700 font-semibold">
          {questionData.instructions ||
            'Read the email below and summarize it using between 25 and 50 words. Type your response in the box at the bottom of the screen.'}
        </p>
      </div>

      {/* Passage content */}
      <div className="mb-6 max-w-6xl mx-auto">
        <div className="text-[14px] leading-relaxed text-gray-800 max-h-[400px] overflow-y-auto">
          <div className="whitespace-pre-wrap">
            {questionData.content || 'Passage will appear here...'}
          </div>
        </div>
      </div>

      {/* Response panel */}
      <div className="max-w-6xl mx-auto border border-[#c8d1dc] bg-white shadow-sm rounded">
        {/* Top toolbar: Copy/Cut/Paste on left, word count on right */}
        <div className="flex items-center border-b border-[#c8d1dc] bg-[#f1f5f9] px-3 py-2">
          <div className="flex gap-1 items-center">
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-[13px] font-medium text-gray-700 border border-[#d1d5db] rounded-sm hover:bg-[#e9eef5]"
              aria-label="Copy"
              type="button"
            >
              Copy
            </button>

            <button
              onClick={handleCut}
              className="px-3 py-1 text-[13px] font-medium text-gray-700 border border-[#d1d5db] rounded-sm hover:bg-[#e9eef5]"
              aria-label="Cut"
              type="button"
            >
              Cut
            </button>

            <button
              onClick={handlePaste}
              className="px-3 py-1 text-[13px] font-medium text-gray-700 border border-[#d1d5db] rounded-sm hover:bg-[#e9eef5]"
              aria-label="Paste"
              type="button"
            >
              Paste
            </button>
          </div>

          <div className="ml-auto pr-4 text-[13px] text-gray-700 flex items-center gap-3">
            <div className={`${wordColorClass()} font-semibold`}>
              {wordCount}
            </div>
            <div className="text-gray-500">/ {maxWords} Word Limit</div>
          </div>
        </div>

        {/* Textarea */}
        <Textarea
          ref={textRef}
          value={summary}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full min-h-[140px] h-[180px] resize-y border-none outline-none p-4 text-[15px] leading-relaxed font-sans focus:ring-0 focus-visible:ring-0"
          style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: 15,
            color: '#0b1724',
            background: 'transparent',
          }}
          placeholder="Type your summary here..."
        />
      </div>

      {/* Word status */}
      <div className="max-w-6xl mx-auto mt-3">
        <div className="text-sm">
          <span className={`font-medium ${wordColorClass()}`}>
            {wordStatusText()}
          </span>
        </div>
      </div>
    </div>
  );
}
