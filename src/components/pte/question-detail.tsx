'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BookOpen, Clock, CheckCircle, XCircle, Volume2 } from 'lucide-react';
import Link from 'next/link';

type Question = {
  id: string;
  type: string;
  title: string;
  section: string;
  difficulty: string;
  questionNumber: number;
  content: string;
  instructions: string;
  timeLimit: number | null;
  sampleAnswer?: string;
  tips?: string[];
  questions?: {
    id: string;
    text: string;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
    answer?: string;
    wordLimit?: string;
  }[];
  passage?: string;
  image?: string;
  wordCount?: number;
  bandScore?: number;
};

export function PTEQuestionDetail({ questionId }: { questionId: string }) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real implementation, we would fetch the specific question
        // For now, we'll simulate with sample data
        const sampleQuestion: Question = {
          id: questionId,
          type: 'read-aloud',
          title: 'Read Aloud',
          section: 'speaking',
          difficulty: 'beginner',
          questionNumber: 1,
          content: "The Sydney Opera House is a multi-venue performing arts centre in Sydney. Located on the banks of the Sydney Harbour, it is often regarded as one of the world's most famous and distinctive buildings.",
          instructions: "Read the following text aloud clearly and at a natural pace.",
          timeLimit: 30,
          sampleAnswer: "The Sydney Opera House is a multi-venue performing arts centre in Sydney. Located on the banks of the Sydney Harbour, it is often regarded as one of the world's most famous and distinctive buildings.",
          tips: [
            "Pause briefly at commas and periods",
            "Maintain a steady pace",
            "Pronounce each word clearly"
          ]
        };
        setQuestion(sampleQuestion);
        setTimeLeft(sampleQuestion.timeLimit || 0);
      } catch (err) {
        setError('Failed to load question. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && !submitted) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, submitted]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setUserAnswers({});
    setSubmitted(false);
    setTimeLeft(question?.timeLimit || 0);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading question...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  if (!question) {
    return <div className="text-center py-8">Question not found</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-orange-600">
                {question.title}
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Question {question.questionNumber} • {question.type.replace('-', ' ')} • {question.section}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className="bg-green-100 text-green-800">
                {question.difficulty}
              </Badge>
              {question.timeLimit && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  {timeLeft}s left
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Instructions</h3>
              <p className="text-gray-700 dark:text-gray-300">{question.instructions}</p>
            </div>

            {question.passage && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Passage</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{question.passage}</p>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">Question</h3>
                {question.type === 'read-aloud' && (
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Volume2 className="h-4 w-4" />
                    Listen
                  </Button>
                )}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">{question.content}</p>
              </div>
            </div>

            {question.questions && question.questions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Your Answers</h3>
                {question.questions.map((q) => (
                  <div key={q.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="font-medium mb-2">{q.text}</p>
                    {q.options ? (
                      <RadioGroup 
                        onValueChange={(value) => handleAnswerChange(q.id, value)}
                        value={userAnswers[q.id] || ''}
                      >
                        {q.options.map((option, idx) => (
                          <div key={idx} className="flex items-center space-x-2 mt-2">
                            <RadioGroupItem value={option} id={`${q.id}-${idx}`} />
                            <Label htmlFor={`${q.id}-${idx}`}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Type your answer here..."
                          value={userAnswers[q.id] || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="min-h-[100px]"
                        />
                        {q.wordLimit && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Word limit: {q.wordLimit}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!question.questions && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Your Answer</h3>
                <Textarea
                  placeholder="Type your answer here..."
                  className="min-h-[150px]"
                />
              </div>
            )}

            {question.tips && question.tips.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Tips</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {question.tips.map((tip, idx) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300">{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {!submitted ? (
                <Button 
                  onClick={handleSubmit} 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={timeLeft === 0}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button 
                  onClick={handleReset} 
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Try Again
                </Button>
              )}
              <Link href="/pte-academic/question-types">
                <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                  Back to Questions
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {submitted && question.sampleAnswer && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-600">
              Sample Answer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{question.sampleAnswer}</p>
              </div>
              {question.wordCount && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Word count: {question.wordCount}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}