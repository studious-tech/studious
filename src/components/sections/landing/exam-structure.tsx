'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Clock,
  FileText,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface QuestionType {
  id: string;
  name: string;
  display_name: string;
  description: string;
  time_limit_seconds: number | null;
  questionCount: number;
}

interface Section {
  id: string;
  name: string;
  display_name: string;
  description: string;
  duration_minutes: number | null;
  question_types: QuestionType[];
  totalQuestions: number;
}

interface ExamStructureData {
  exam: {
    id: string;
    display_name: string;
    description: string;
    duration_minutes: number;
    totalQuestions: number;
    totalSections: number;
    totalQuestionTypes: number;
  };
  sections: Section[];
}

interface ExamStructureProps {
  examId: string;
}

export default function ExamStructure({ examId }: ExamStructureProps) {
  const [data, setData] = useState<ExamStructureData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        const response = await fetch(`/api/exams/${examId}/structure`);
        if (!response.ok) throw new Error('Failed to fetch exam structure');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStructure();
  }, [examId]);

  if (isLoading) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 p-6">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">
                Failed to load exam structure. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Flexible';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Complete {data.exam.display_name} Structure
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            {data.exam.description}
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">
                {formatDuration(data.exam.duration_minutes)}
              </span>
              <span className="text-muted-foreground text-sm">Total Duration</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span className="font-semibold">{data.exam.totalQuestions}</span>
              <span className="text-muted-foreground text-sm">Questions Available</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <span className="font-semibold">{data.exam.totalSections}</span>
              <span className="text-muted-foreground text-sm">Sections</span>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {data.sections.map((section, idx) => (
            <Card key={section.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-sm">
                        Section {idx + 1}
                      </Badge>
                      {section.duration_minutes && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDuration(section.duration_minutes)}
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-2xl mb-2">
                      {section.display_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  <Badge className="bg-blue-600 text-white">
                    {section.totalQuestions} Questions
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {section.question_types.map((qt) => (
                    <Card
                      key={qt.id}
                      className="group hover:shadow-md transition-all hover:border-blue-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base mb-1 group-hover:text-blue-600 transition-colors">
                              {qt.display_name}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {qt.description}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">
                                {qt.questionCount}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                questions
                              </span>
                            </div>
                            {qt.time_limit_seconds && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-muted-foreground text-xs">
                                  {Math.floor(qt.time_limit_seconds / 60)} min
                                </span>
                              </div>
                            )}
                          </div>

                          <Link
                            href={`/${examId}/dashboard?tab=create-test&questionType=${qt.id}`}
                          >
                            <Button size="sm" variant="ghost" className="h-7">
                              Practice
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Card className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2">
                Ready to Start Practicing?
              </h3>
              <p className="mb-6 opacity-90">
                Access all {data.exam.totalQuestions} questions across{' '}
                {data.exam.totalQuestionTypes} question types
              </p>
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Link href={`/${examId}/dashboard`}>
                  Go to Dashboard <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
