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
  FileText,
  Lightbulb,
  BookOpen
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

interface IELTSWritingTask2Props {
  question: TestSessionQuestion;
  examId: string;
  onResponse: (response: ResponseData) => void;
}

export default function IELTSWritingTask2({
  question,
  onResponse,
}: IELTSWritingTask2Props) {
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(2400); // 40 minutes
  const [isStarted, setIsStarted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const minWords = 250;
  const recommendedWords = 280;

  const questionData = question.question;

  // Sample essay question - in real implementation this would come from props
  const essayQuestion = {
    topic: "Some people believe that unpaid community service should be a compulsory part of high school programs (for example working for a charity, improving the neighborhood or teaching sports to younger children).",
    question: "To what extent do you agree or disagree?",
    instructions: "Give reasons for your answer and include any relevant examples from your own knowledge or experience."
  };

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
          toast.info('Time is up! Please submit your Task 2 essay.');
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
    return 'Excellent length';
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="ielts-writing-task-2 h-full bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Basic Header - Real IELTS Style */}
      <div className="bg-gray-100 border-b-2 border-gray-300 p-3">
        <div className="flex items-center justify-between">
          <div className="text-black text-base font-bold">IELTS Academic Writing - Task 2</div>
          <div className="text-black text-sm">Question {question.sequenceNumber}</div>
        </div>
      </div>

      {/* Simple Content Layout */}
      <div className="flex h-full">
        {/* Left Panel: Essay Question */}
        <div className="w-1/2 p-4 bg-white border-r border-gray-300 overflow-y-auto">
          <div className="space-y-4">
            {/* Simple Header */}
            <div className="border-b border-gray-300 pb-2">
              <h3 className="text-base font-bold text-black">Task 2: Essay Writing</h3>
              <p className="text-sm text-gray-700">Write at least 250 words</p>
            </div>

            {/* Instructions Box */}
            {questionData.instructions && (
              <div className="border border-gray-400 p-3 bg-gray-50">
                <div className="text-sm text-black">
                  {questionData.instructions}
                </div>
              </div>
            )}

            {/* Basic Essay Question */}
            <div className="border-2 border-gray-400 p-4 bg-white">
              <div className="space-y-3">
                <h4 className="font-bold text-black text-sm">Essay Question</h4>

                <div className="bg-gray-100 border border-gray-300 p-4">
                  <div className="space-y-3">
                    <p className="text-black text-sm">
                      {essayQuestion.topic}
                    </p>

                    <p className="text-sm font-bold text-black">
                      {essayQuestion.question}
                    </p>

                    <p className="text-sm text-black">
                      {essayQuestion.instructions}
                    </p>

                    <div className="text-sm text-black bg-gray-200 border border-gray-300 p-2">
                      Write at least 250 words.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Task Requirements */}
            <div className="border border-gray-400 p-3 bg-gray-50">
              <h4 className="font-bold text-black text-sm mb-2">Task Requirements:</h4>
              <ul className="text-xs text-black space-y-1 ml-4" style={{ listStyleType: 'disc' }}>
                <li>Write at least 250 words</li>
                <li>Present a clear position/opinion</li>
                <li>Support ideas with relevant examples</li>
                <li>Use formal, academic language</li>
                <li>Organize ideas logically with clear paragraphs</li>
                <li>Address all parts of the question</li>
                <li>Use a variety of vocabulary and grammar</li>
                <li>Complete in approximately 40 minutes</li>
              </ul>
            </div>

            {/* Basic Essay Structure Guide */}
            <div className="border border-gray-400 p-3 bg-gray-50">
              <h4 className="font-bold text-black text-sm mb-2">Suggested Structure:</h4>
              <div className="text-xs text-black space-y-1">
                <div>
                  <strong>Introduction (50-60 words):</strong> Paraphrase the question + your thesis statement
                </div>
                <div>
                  <strong>Body Paragraph 1 (80-90 words):</strong> First main idea + supporting examples
                </div>
                <div>
                  <strong>Body Paragraph 2 (80-90 words):</strong> Second main idea + supporting examples
                </div>
                <div>
                  <strong>Conclusion (40-50 words):</strong> Summarize main points + restate opinion
                </div>
              </div>
            </div>

            {/* Basic Useful Phrases */}
            <div className="border border-gray-400 p-3 bg-gray-50">
              <h4 className="font-bold text-black text-sm mb-2">Useful Phrases:</h4>
              <div className="text-xs text-black space-y-1">
                <div>
                  <strong>Opinion:</strong> I believe/think/feel that..., In my opinion..., From my perspective...
                </div>
                <div>
                  <strong>Examples:</strong> For instance..., For example..., Such as..., A case in point is...
                </div>
                <div>
                  <strong>Contrast:</strong> However..., On the other hand..., Nevertheless..., Despite this...
                </div>
                <div>
                  <strong>Conclusion:</strong> In conclusion..., To summarize..., Overall..., In summary...
                </div>
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
                  <h3 className="text-base font-bold text-black">Ready to Start Task 2?</h3>
                  <p className="text-sm text-black">
                    You have 40 minutes to write at least 250 words expressing your opinion on the given topic.
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
                    <span className={`font-bold ${timeRemaining < 600 ? 'text-red-600' : 'text-black'}`}>
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
                  <h3 className="text-sm font-bold text-black">Your Task 2 Essay</h3>
                  {wordCount >= minWords && (
                    <span className="text-xs text-green-600 border border-green-300 px-2 py-1 bg-green-50">
                      ✓ {getWordCountStatus()}
                    </span>
                  )}
                </div>

                <textarea
                  placeholder="Write your Task 2 essay here. Present your opinion clearly and support it with relevant examples and explanations..."
                  value={essay}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="w-full min-h-[400px] p-3 text-sm text-black border border-gray-300 resize-none focus:outline-none focus:border-gray-500"
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

            {/* Basic Assessment Criteria */}
            <div className="border border-gray-400 p-3 bg-gray-50">
              <h5 className="font-bold text-black text-sm mb-2">Assessment Criteria:</h5>
              <div className="text-xs text-black space-y-1">
                <div><strong>Task Achievement (25%):</strong> Answer all parts, clear position</div>
                <div><strong>Coherence & Cohesion (25%):</strong> Logical organization, linking</div>
                <div><strong>Lexical Resource (25%):</strong> Vocabulary range and accuracy</div>
                <div><strong>Grammar (25%):</strong> Range and accuracy of structures</div>
              </div>
            </div>

            {/* Basic Task Details */}
            <div className="border border-gray-400 p-3 bg-white">
              <h5 className="text-sm font-bold text-black mb-2">Task Details</h5>
              <div className="text-xs text-black space-y-1">
                <div>Type: {questionData.questionType.displayName}</div>
                <div>Minimum words: {minWords}</div>
                <div>Recommended time: 40 minutes</div>
                <div>Status: {isStarted ? 'In progress' : 'Not started'}</div>
                <div>Worth: 2/3 of total writing score</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}