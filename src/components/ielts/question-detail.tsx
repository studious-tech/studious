'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BookOpen, Clock, CheckCircle, XCircle, Volume2, Play, Trophy } from 'lucide-react';
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
  aiScore?: boolean;
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
  correctAnswers?: string[];
  paragraphs?: { id: string; text: string }[];
  correctOrder?: string[];
  blanks?: { id: string; options: string[]; correctAnswer: string }[];
};

export function IELTSQuestionDetail({ questionId }: { questionId: string }) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real implementation, we would fetch from the API
        // For now, we'll simulate with sample data based on question type
        let sampleQuestion: Question;
        
        switch(questionId) {
          case 'read-aloud-1':
            sampleQuestion = {
              id: questionId,
              type: 'read-aloud',
              title: 'Read Aloud',
              section: 'speaking',
              difficulty: 'beginner',
              questionNumber: 1,
              content: "The Museum of Contemporary Art in Sydney is one of the most important museums in Australia. It was opened in 1991 and has since become a major cultural institution. The museum's collection includes works by both Australian and international artists.",
              instructions: "Read the following text aloud clearly and at a natural pace.",
              timeLimit: 30,
              sampleAnswer: "The Museum of Contemporary Art in Sydney is one of the most important museums in Australia. It was opened in 1991 and has since become a major cultural institution. The museum's collection includes works by both Australian and international artists.",
              tips: [
                "Pause briefly at commas and periods",
                "Maintain a steady pace",
                "Pronounce each word clearly"
              ],
              aiScore: true
            };
            break;
          case 'repeat-sentence-1':
            sampleQuestion = {
              id: questionId,
              type: 'repeat-sentence',
              title: 'Repeat Sentence',
              section: 'speaking',
              difficulty: 'intermediate',
              questionNumber: 2,
              content: "The economic growth of developing countries has accelerated significantly over the past decade due to increased international trade and foreign investment.",
              instructions: "Listen to the sentence and repeat it exactly as you hear it.",
              timeLimit: 5,
              sampleAnswer: "The economic growth of developing countries has accelerated significantly over the past decade due to increased international trade and foreign investment.",
              tips: [
                "Listen carefully to the entire sentence",
                "Repeat exactly what you hear",
                "Don't add or omit any words"
              ],
              aiScore: true
            };
            break;
          case 'multiple-choice-1':
            sampleQuestion = {
              id: questionId,
              type: 'multiple-choice',
              title: 'Multiple Choice',
              section: 'reading',
              difficulty: 'beginner',
              questionNumber: 1,
              content: "Read the passage about renewable energy and choose the correct answer from A, B, C, or D.",
              instructions: "Read the passage and answer the following questions by choosing the correct option.",
              timeLimit: null,
              passage: "Renewable energy is energy that is collected from renewable resources, which are naturally replenished on a human timescale, such as sunlight, wind, rain, tides, waves, and geothermal heat. Renewable energy often provides energy in four important areas: electricity generation, air and water heating/cooling, transportation, and rural (off-grid) energy services.",
              questions: [
                {
                  id: 'mc-1-1',
                  text: "What is renewable energy?",
                  options: [
                    "A) Energy from fossil fuels",
                    "B) Energy from non-renewable resources", 
                    "C) Energy from resources that naturally replenish",
                    "D) Energy from nuclear power"
                  ],
                  correctAnswer: "C) Energy from resources that naturally replenish",
                  explanation: "The passage states that renewable energy is 'collected from renewable resources, which are naturally replenished on a human timescale'."
                },
                {
                  id: 'mc-1-2',
                  text: "Which of the following is NOT mentioned as a source of renewable energy?",
                  options: [
                    "A) Sunlight",
                    "B) Wind",
                    "C) Nuclear power",
                    "D) Geothermal heat"
                  ],
                  correctAnswer: "C) Nuclear power",
                  explanation: "The passage mentions sunlight, wind, and geothermal heat as sources of renewable energy, but does not mention nuclear power."
                }
              ],
              aiScore: false
            };
            break;
          default:
            sampleQuestion = {
              id: questionId,
              type: 'read-aloud',
              title: 'Read Aloud',
              section: 'speaking',
              difficulty: 'beginner',
              questionNumber: 1,
              content: "The Museum of Contemporary Art in Sydney is one of the most important museums in Australia. It was opened in 1991 and has since become a major cultural institution. The museum's collection includes works by both Australian and international artists.",
              instructions: "Read the following text aloud clearly and at a natural pace.",
              timeLimit: 30,
              sampleAnswer: "The Museum of Contemporary Art in Sydney is one of the most important museums in Australia. It was opened in 1991 and has since become a major cultural institution. The museum's collection includes works by both Australian and international artists.",
              tips: [
                "Pause briefly at commas and periods",
                "Maintain a steady pace",
                "Pronounce each word clearly"
              ],
              aiScore: true
            };
        }
        
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

  const handlePlayAudio = () => {
    setIsPlaying(true);
    // Simulate audio playback
    setTimeout(() => setIsPlaying(false), 3000);
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
              <CardTitle className="text-2xl font-bold text-blue-600">
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
              {question.aiScore && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  AI Score
                </Badge>
              )}
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
                {(question.type === 'read-aloud' || question.type === 'repeat-sentence') && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={handlePlayAudio}
                    disabled={isPlaying}
                  >
                    {isPlaying ? (
                      <>
                        <Play className="h-4 w-4 animate-pulse" />
                        Playing...
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4" />
                        Listen
                      </>
                    )}
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

            {question.paragraphs && question.paragraphs.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Re-order Paragraphs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.paragraphs.map((p) => (
                    <div 
                      key={p.id} 
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-move bg-white dark:bg-gray-700"
                    >
                      <p className="text-gray-700 dark:text-gray-300">{p.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {question.blanks && question.blanks.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Fill in the Blanks</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">
                    {/* This would be the passage with blanks to fill */}
                    Complete the passage by selecting the most appropriate word from the dropdown menu for each blank.
                  </p>
                </div>
              </div>
            )}

            {!question.questions && !question.paragraphs && !question.blanks && (
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
                  disabled={timeLeft === 0 && question.timeLimit !== null}
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
              <Link href="/ielts-academic/dashboard/question-types">
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
              {question.bandScore && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Trophy className="h-4 w-4 mr-1" />
                  Band score: {question.bandScore}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {submitted && question.questions && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-600">
              Review Your Answers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {question.questions.map((q) => (
                <div key={q.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-medium mb-2">{q.text}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Your answer:</span>
                    <span>{userAnswers[q.id] || 'Not answered'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-medium">Correct answer:</span>
                    <span className="text-green-600">{q.correctAnswer}</span>
                  </div>
                  {q.explanation && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}