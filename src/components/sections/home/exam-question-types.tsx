import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Headphones, MessageSquare, PenTool, Mic, Search, BarChart3, Brain, Users, Target } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ExamQuestionTypes() {
  const examTypes = [
    {
      name: 'IELTS',
      color: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
      icon: <BookOpen className="size-5 text-green-600 dark:text-green-400" />,
      description: 'The International English Language Testing System for study, work, or migration purposes.',
      questionCategories: [
        {
          category: 'Listening',
          icon: <Headphones className="size-4 text-blue-600 dark:text-blue-400" />,
          questions: [
            'Multiple Choice',
            'Matching',
            'Plan/Map/Diagram Labelling',
            'Form/Note/Table/Flow-chart Completion',
            'Sentence Completion',
            'Short Answer Questions'
          ]
        },
        {
          category: 'Reading',
          icon: <BookOpen className="size-4 text-purple-600 dark:text-purple-400" />,
          questions: [
            'Multiple Choice',
            'Identifying Information',
            'Identifying Writer\'s Views',
            'Matching Information',
            'Matching Headings',
            'Matching Features',
            'Sentence Completion',
            'Summary/Note/Table/Flow-chart Completion',
            'Diagram Labelling',
            'Short Answer Questions'
          ]
        },
        {
          category: 'Writing',
          icon: <PenTool className="size-4 text-orange-600 dark:text-orange-400" />,
          questions: [
            'Task 1 (Academic) - Graph Description',
            'Task 1 (General) - Letter Writing',
            'Task 2 - Essay Writing'
          ]
        },
        {
          category: 'Speaking',
          icon: <MessageSquare className="size-4 text-red-600 dark:text-red-400" />,
          questions: [
            'Introduction & Interview',
            'Long Turn (Cue Card)',
            'Two-way Discussion'
          ]
        }
      ]
    },
    {
      name: 'PTE Academic',
      color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
      icon: <BarChart3 className="size-5 text-blue-600 dark:text-blue-400" />,
      description: 'Pearson Test of English Academic for study, work, or migration in Australia, New Zealand, UK, and more.',
      questionCategories: [
        {
          category: 'Speaking & Writing',
          icon: <Mic className="size-4 text-blue-600 dark:text-blue-400" />,
          questions: [
            'Read Aloud',
            'Repeat Sentence',
            'Describe Image',
            'Re-tell Lecture',
            'Answer Short Question',
            'Summarize Written Text',
            'Write Essay'
          ]
        },
        {
          category: 'Reading',
          icon: <Search className="size-4 text-purple-600 dark:text-purple-400" />,
          questions: [
            'Multiple-choice (Single Answer)',
            'Multiple-choice (Multiple Answers)',
            'Re-order Paragraphs',
            'Reading: Fill in the Blanks',
            'Reading & Writing: Fill in the Blanks'
          ]
        },
        {
          category: 'Listening',
          icon: <Headphones className="size-4 text-orange-600 dark:text-orange-400" />,
          questions: [
            'Summarize Spoken Text',
            'Multiple Choice (Multiple Answers)',
            'Fill in the Blanks',
            'Highlight Correct Summary',
            'Multiple Choice (Single Answer)',
            'Select Missing Word',
            'Highlight Incorrect Words',
            'Write from Dictation'
          ]
        }
      ]
    },
    {
      name: 'UCAT',
      color: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800',
      icon: <Brain className="size-5 text-amber-600 dark:text-amber-400" />,
      description: 'University Clinical Aptitude Test for medical and dental school admissions in the UK, Australia, and New Zealand.',
      questionCategories: [
        {
          category: 'Verbal Reasoning',
          icon: <BookOpen className="size-4 text-blue-600 dark:text-blue-400" />,
          questions: [
            'Single Best Answer',
            'Multiple Item Sets'
          ]
        },
        {
          category: 'Decision Making',
          icon: <Target className="size-4 text-purple-600 dark:text-purple-400" />,
          questions: [
            'Multiple Choice Questions',
            'Yes/No Statements'
          ]
        },
        {
          category: 'Quantitative Reasoning',
          icon: <BarChart3 className="size-4 text-green-600 dark:text-green-400" />,
          questions: [
            'Multiple Choice Questions',
            'Data Interpretation'
          ]
        },
        {
          category: 'Abstract Reasoning',
          icon: <Search className="size-4 text-orange-600 dark:text-orange-400" />,
          questions: [
            'Type 1 - A/B Sets',
            'Type 2 - Series',
            'Type 3 - Statement',
            'Type 4 - Analogies'
          ]
        },
        {
          category: 'Situational Judgement',
          icon: <Users className="size-4 text-red-600 dark:text-red-400" />,
          questions: [
            'Appropriateness Ratings',
            'Ranking Questions'
          ]
        }
      ]
    }
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-balance text-3xl font-semibold md:text-4xl mb-4">
            Comprehensive Practice for Every Exam
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Master all question formats with our targeted practice system designed specifically for international exams.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {examTypes.map((exam, examIndex) => (
            <Card 
              key={examIndex} 
              className={`p-6 ${exam.color} hover:shadow-lg transition-all duration-200 flex flex-col`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border">
                  {exam.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{exam.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{exam.description}</p>
                </div>
              </div>

              <div className="space-y-6 flex-grow">
                {exam.questionCategories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white dark:bg-gray-800 rounded-md border">
                        {category.icon}
                      </div>
                      <h4 className="font-semibold">{category.category}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.questions.map((question, questionIndex) => (
                        <Badge 
                          key={questionIndex} 
                          variant="outline" 
                          className="text-xs py-1 px-2"
                        >
                          {question}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button asChild size="sm" className="w-full">
                  <Link href={`/exams/${exam.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    Start Practicing
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            With over 500+ unique question types and 10,000+ practice items across all exams
          </p>
        </div>
      </div>
    </section>
  );
}