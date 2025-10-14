'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  FileText
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
  response: string;
  responseType: string;
}

interface IELTSWritingTask1Props {
  question: TestSessionQuestion;
  examId: string;
  onResponse: (response: ResponseData) => void;
}

export default function IELTSWritingTask1({
  question,
  onResponse,
}: IELTSWritingTask1Props) {
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes
  const [isStarted, setIsStarted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const minWords = 150;
  const recommendedWords = 180;

  const questionData = question.question;

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleTextChange = (text: string) => {
    setEssay(text);
    const count = countWords(text);
    setWordCount(count);

    onResponse({
      questionId: questionData.id,
      sessionQuestionId: question.sessionQuestionId,
      response: text,
      responseType: 'text_response',
    });
  };

  const startTimer = () => {
    setIsStarted(true);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          toast.info('Time is up! Please submit your Task 1 answer.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWordCountColor = () => {
    if (wordCount < minWords) return 'text-red-600';
    if (wordCount >= minWords && wordCount < recommendedWords) return 'text-orange-600';
    return 'text-green-600';
  };

  const getWordCountStatus = () => {
    if (wordCount < minWords) return `Need ${minWords - wordCount} more words`;
    if (wordCount >= minWords && wordCount < recommendedWords) return 'Good, but could be longer';
    return 'Good length';
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="ielts-writing-task-1 h-full bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Basic Header - Real IELTS Style */}
      <div className="bg-gray-100 border-b-2 border-gray-300 p-3">
        <div className="flex items-center justify-between">
          <div className="text-black text-base font-bold">IELTS Academic Writing - Task 1</div>
          <div className="text-black text-sm">Question {question.sequenceNumber}</div>
        </div>
      </div>

      {/* Simple Content Layout */}
      <div className="flex h-full">
        {/* Left Panel: Chart/Graph/Diagram */}
        <div className="w-1/2 p-4 bg-white border-r border-gray-300 overflow-y-auto">
          <div className="space-y-4">
            {/* Simple Header */}
            <div className="border-b border-gray-300 pb-2">
              <h3 className="text-base font-bold text-black">Task 1: Report Writing</h3>
              <p className="text-sm text-gray-700">Write at least 150 words</p>
            </div>

            {/* Instructions Box */}
            {questionData.instructions && (
              <div className="border border-gray-400 p-3 bg-gray-50">
                <div className="text-sm text-black">
                  {questionData.instructions}
                </div>
              </div>
            )}

            {/* Chart/Graph Area - Basic Style */}
            <div className="border-2 border-gray-400 p-4 bg-white">
              <div className="space-y-3">
                <h4 className="font-bold text-black text-sm">Chart/Graph/Diagram</h4>

                {/* Placeholder for actual chart */}
                <div className="bg-gray-100 border border-gray-300 p-6 text-center min-h-[250px] flex items-center justify-center">
                  <div className="space-y-2">
                    <div className="text-2xl text-gray-500">📊</div>
                    <p className="text-sm text-black font-bold">Chart, Graph, Table, or Diagram</p>
                    <p className="text-xs text-gray-600">
                      In the real exam, you'll see a visual representation of data
                    </p>
                  </div>
                </div>

                <div className="text-sm text-black border-t border-gray-300 pt-3">
                  <p className="font-bold mb-1">Sample Task:</p>
                  <p className="mb-2">
                    The chart below shows the percentage of households in owned and rented
                    accommodation in England and Wales between 1918 and 2011.
                  </p>
                  <p className="font-bold">
                    Summarise the information by selecting and reporting the main features,
                    and make comparisons where relevant.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Task Requirements */}
            <div className="border border-gray-400 p-3 bg-gray-50">
              <h4 className="font-bold text-black text-sm mb-2">Task Requirements:</h4>
              <ul className="text-xs text-black space-y-1 ml-4" style={{ listStyleType: 'disc' }}>
                <li>Write at least 150 words</li>
                <li>Describe the main trends and patterns</li>
                <li>Include specific data from the visual</li>
                <li>Make relevant comparisons</li>
                <li>Use appropriate vocabulary for data description</li>
                <li>Organize information logically</li>
                <li>Write in formal, academic style</li>
                <li>Complete in approximately 20 minutes</li>
              </ul>
            </div>

            {/* Basic Useful Phrases */}
            <div className="border border-gray-400 p-3 bg-gray-50">
              <h4 className="font-bold text-black text-sm mb-2">Useful Phrases:</h4>
              <div className="text-xs text-black space-y-1">
                <div><strong>Opening:</strong> The chart/graph/table shows/illustrates/depicts...</div>
                <div><strong>Trends:</strong> increased significantly, declined gradually, remained stable...</div>
                <div><strong>Comparisons:</strong> In contrast, Similarly, On the other hand...</div>
                <div><strong>Data:</strong> approximately, roughly, exactly, precisely...</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Basic Writing Interface */}
        <div className="w-1/2 p-4 bg-gray-50 overflow-y-auto">
          <div className="space-y-4">
            {/* Simple Timer and Word Count */}
            {!isStarted ? (
              <div className="border border-gray-400 p-4 bg-white">
                <div className="text-center space-y-3">
                  <h3 className="text-base font-bold text-black">Ready to Start Task 1?</h3>
                  <p className="text-sm text-black">
                    You have 20 minutes to write at least 150 words describing the visual information.
                  </p>
                  <button
                    onClick={startTimer}
                    className="bg-gray-200 border-2 border-gray-400 px-6 py-2 text-sm font-bold text-black hover:bg-gray-300"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    Start Writing
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-gray-400 p-3 bg-white">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-black font-bold">Time Remaining: </span>
                    <span className={`font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-black'}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  <div>
                    <span className="text-black font-bold">Words: </span>
                    <span className={`font-bold ${getWordCountColor()}`}>
                      {wordCount}/{minWords}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Writing Area */}
            <div className="border-2 border-gray-400 p-3 bg-white">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-300 pb-2">
                  <h3 className="text-sm font-bold text-black">Your Task 1 Report</h3>
                  {wordCount >= minWords && (
                    <span className="text-xs text-green-600 border border-green-300 px-2 py-1 bg-green-50">
                      ✓ {getWordCountStatus()}
                    </span>
                  )}
                </div>

                <textarea
                  placeholder="Write your Task 1 report here. Describe the main features of the visual information and make relevant comparisons..."
                  value={essay}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="w-full min-h-[350px] p-3 text-sm text-black border border-gray-300 resize-none focus:outline-none focus:border-gray-500"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                  disabled={!isStarted || timeRemaining === 0}
                />

                <div className="flex items-center justify-between text-xs border-t border-gray-300 pt-2">
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${getWordCountColor()}`}>
                      {wordCount} words
                    </span>
                    <span className={getWordCountColor()}>
                      {getWordCountStatus()}
                    </span>
                  </div>

                  {wordCount < minWords && (
                    <span className="text-red-600 bg-red-50 border border-red-300 px-2 py-1 text-xs">
                      ⚠ Need more words
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Structure Guide */}
            <div className="border border-gray-400 p-3 bg-gray-50">
              <h5 className="font-bold text-black text-sm mb-2">Suggested Structure:</h5>
              <div className="text-xs text-black space-y-1">
                <div><strong>Introduction (1-2 sentences):</strong> Paraphrase the task</div>
                <div><strong>Overview (1-2 sentences):</strong> Main trends/patterns</div>
                <div><strong>Body Paragraph 1:</strong> Describe key features with data</div>
                <div><strong>Body Paragraph 2:</strong> Compare and contrast details</div>
              </div>
            </div>

            {/* Basic Task Info */}
            <div className="border border-gray-400 p-3 bg-white">
              <h5 className="text-sm font-bold text-black mb-2">Task Details</h5>
              <div className="text-xs text-black space-y-1">
                <div>Type: {questionData.questionType.displayName}</div>
                <div>Minimum words: {minWords}</div>
                <div>Recommended time: 20 minutes</div>
                <div>Status: {isStarted ? 'In progress' : 'Not started'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}