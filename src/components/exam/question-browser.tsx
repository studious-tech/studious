// components/exam/question-browser.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Question, QuestionType, Section } from '@/lib/interfaces';

export function QuestionBrowser({ examId }: { examId: string }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('');
  const [loading, setLoading] = useState<'sections' | 'questionTypes' | 'questions' | 'idle'>('sections');
  const [error, setError] = useState<string | null>(null);

  // Fetch sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading('sections');
        setError(null);
        
        const response = await fetch(`/api/exams/${examId}/sections`);
        if (!response.ok) throw new Error('Failed to fetch sections');
        
        const sectionsData: Section[] = await response.json();
        setSections(sectionsData);
        
        if (sectionsData.length > 0) {
          setSelectedSection(sectionsData[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sections');
        console.error('Failed to fetch sections:', err);
      } finally {
        setLoading('idle');
      }
    };

    if (examId) {
      fetchSections();
    }
  }, [examId]);

  // Fetch question types
  useEffect(() => {
    const fetchQuestionTypes = async () => {
      if (!selectedSection) {
        setQuestionTypes([]);
        setQuestions([]);
        return;
      }
      
      try {
        setLoading('questionTypes');
        setError(null);
        
        const response = await fetch(`/api/exams/${examId}/sections/${selectedSection}/question-types`);
        if (!response.ok) throw new Error('Failed to fetch question types');
        
        const typesData: QuestionType[] = await response.json();
        setQuestionTypes(typesData);
        
        if (typesData.length > 0) {
          setSelectedQuestionType(typesData[0].id);
        } else {
          setSelectedQuestionType('');
          setQuestions([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch question types');
        console.error('Failed to fetch question types:', err);
      } finally {
        setLoading('idle');
      }
    };

    fetchQuestionTypes();
  }, [selectedSection, examId]);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedQuestionType) {
        setQuestions([]);
        return;
      }
      
      try {
        setLoading('questions');
        setError(null);
        
        const response = await fetch(`/api/exams/${examId}/sections/${selectedSection}/question-types/${selectedQuestionType}/questions`);
        if (!response.ok) throw new Error('Failed to fetch questions');
        
        const questionsData: Question[] = await response.json();
        setQuestions(questionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch questions');
        console.error('Failed to fetch questions:', err);
      } finally {
        setLoading('idle');
      }
    };

    fetchQuestions();
  }, [selectedQuestionType, selectedSection, examId]);

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-800';
    if (difficulty <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getSectionColor = (sectionId: string) => {
    switch (sectionId) {
      case 'pte-speaking':
      case 'ielts-speaking':
        return 'text-orange-600';
      case 'pte-listening':
      case 'ielts-listening':
        return 'text-purple-600';
      case 'pte-reading':
      case 'ielts-reading':
        return 'text-blue-600';
      case 'pte-writing':
      case 'ielts-writing':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading === 'sections' && sections.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading sections...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Section Selector */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={selectedSection === section.id ? 'default' : 'outline'}
            onClick={() => setSelectedSection(section.id)}
            className={selectedSection === section.id ? 'bg-blue-600 hover:bg-blue-700' : ''}
            disabled={loading !== 'idle'}
          >
            {section.display_name}
          </Button>
        ))}
      </div>

      {/* Question Type Selector */}
      {(loading === 'questionTypes' || questionTypes.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {loading === 'questionTypes' ? (
            <div className="flex justify-center items-center h-12 w-full">
              Loading question types...
            </div>
          ) : (
            questionTypes.map((questionType) => (
              <Button
                key={questionType.id}
                variant={selectedQuestionType === questionType.id ? 'default' : 'outline'}
                onClick={() => setSelectedQuestionType(questionType.id)}
                className={`flex items-center gap-2 ${
                  selectedQuestionType === questionType.id ? 'bg-blue-600 hover:bg-blue-700' : ''
                }`}
                disabled={loading !== 'idle'}
              >
                {questionType.display_name}
                {questionType.scoring_method.includes('ai') && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    AI Score
                  </Badge>
                )}
              </Button>
            ))
          )}
        </div>
      )}

      {/* Questions Grid */}
      <div>
        {loading === 'questions' ? (
          <div className="flex justify-center items-center h-64">Loading questions...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">Error: {error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questions.map((question) => {
              const currentQuestionType = questionTypes.find(qt => qt.id === question.question_type_id);
              
              return (
                <Card key={question.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className={`text-xl font-bold ${getSectionColor(selectedSection)}`}>
                          {currentQuestionType?.display_name}
                        </CardTitle>
                        <CardDescription className="text-gray-500 dark:text-gray-400">
                          {question.title || question.content.substring(0, 100) + '...'}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getDifficultyColor(question.difficulty_level)}>
                          Level {question.difficulty_level}
                        </Badge>
                        {currentQuestionType?.scoring_method.includes('ai') && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            AI Score
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                        {question.content}
                      </p>
                      
                      {question.expected_duration_seconds && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          Time limit: {question.expected_duration_seconds} seconds
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/${examId.replace('-academic', '')}/question-types/practice?id=${question.id}`}>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Practice
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}