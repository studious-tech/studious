'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, BookOpen } from 'lucide-react';

type Question = {
  id: string;
  type: string;
  title: string;
  description: string;
  count: number;
};

type Test = {
  id: string;
  title: string;
  duration: number;
  questions: Question[];
};

type Format = {
  id: string;
  title: string;
  description: string;
  tests: Test[];
};

type QuestionType = {
  id: string;
  title: string;
  description: string;
  formats: Format[];
};

export function PTEQuestionTypeHierarchy() {
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchQuestionTypes = async () => {
      try {
        const response = await fetch('/api/pte/question-types');
        const data = await response.json();
        setQuestionTypes(data);
      } catch (error) {
        console.error('Failed to fetch question types:', error);
      }
    };

    fetchQuestionTypes();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isExpanded = (id: string) => expandedItems.has(id);

  return (
    <div className="space-y-6">
      {questionTypes.map((questionType) => (
        <Card key={questionType.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-600 flex items-center justify-between">
              <span>{questionType.title}</span>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                {questionType.formats.length} Formats
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              {questionType.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questionType.formats.map((format) => (
                <div key={format.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg"
                    onClick={() => toggleExpand(format.id)}
                  >
                    <div className="flex items-center">
                      {isExpanded(format.id) ? 
                        <ChevronDown className="h-5 w-5 text-blue-600 mr-2" /> : 
                        <ChevronRight className="h-5 w-5 text-blue-600 mr-2" />
                      }
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{format.title}</h3>
                    </div>
                    <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                      {format.tests.length} Tests
                    </Badge>
                  </div>
                  
                  {isExpanded(format.id) && (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-b-lg">
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{format.description}</p>
                      <div className="space-y-4">
                        {format.tests.map((test) => (
                          <div key={test.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div 
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => toggleExpand(test.id)}
                            >
                              <div className="flex items-center">
                                {isExpanded(test.id) ? 
                                  <ChevronDown className="h-4 w-4 text-blue-600 mr-2" /> : 
                                  <ChevronRight className="h-4 w-4 text-blue-600 mr-2" />
                                }
                                <h4 className="font-medium text-gray-900 dark:text-white">{test.title}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                                  {test.duration} min
                                </Badge>
                                <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                                  {test.questions.length} Question Sets
                                </Badge>
                              </div>
                            </div>
                            
                            {isExpanded(test.id) && (
                              <div className="mt-4 space-y-3">
                                {test.questions.map((question) => (
                                  <div key={question.id} className="flex items-start p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                    <BookOpen className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                                    <div className="flex-1">
                                      <div className="flex justify-between">
                                        <h5 className="font-medium text-gray-900 dark:text-white">{question.title}</h5>
                                        <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                                          {question.count} questions
                                        </Badge>
                                      </div>
                                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{question.description}</p>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="mt-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                      >
                                        Practice
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}