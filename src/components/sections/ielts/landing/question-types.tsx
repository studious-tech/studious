import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Headphones, MessageSquare, PenTool, CheckCircle, Clock, Target } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function QuestionTypes() {
  const skillSections = [
    {
      name: 'Reading',
      color: 'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800',
      iconColor: 'text-purple-600 dark:text-purple-400',
      icon: <BookOpen className="size-6" />,
      duration: '60 minutes',
      passages: '3 passages',
      questions: '40 questions',
      description: 'Academic texts from books, journals, magazines, and newspapers designed for university-level study.',
      questionTypes: [
        { name: 'Multiple Choice', description: 'Choose the correct answer from options A, B, C or D' },
        { name: 'Identifying Information (True/False/Not Given)', description: 'Determine if statements agree with the information in the text' },
        { name: 'Identifying Writer\'s Views (Yes/No/Not Given)', description: 'Identify the writer\'s opinion or attitude' },
        { name: 'Matching Information', description: 'Match information to the correct paragraph' },
        { name: 'Matching Headings', description: 'Match headings to paragraphs or sections' },
        { name: 'Matching Features', description: 'Match statements to people, theories, or categories' },
        { name: 'Sentence Completion', description: 'Complete sentences with words from the passage' },
        { name: 'Summary Completion', description: 'Complete a summary using words from a word bank or passage' },
        { name: 'Diagram Labelling', description: 'Label parts of a diagram using words from the passage' },
        { name: 'Short Answer Questions', description: 'Answer questions using no more than three words from the passage' }
      ]
    },
    {
      name: 'Writing',
      color: 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800',
      iconColor: 'text-orange-600 dark:text-orange-400',
      icon: <PenTool className="size-6" />,
      duration: '60 minutes',
      passages: '2 tasks',
      questions: '2 essays',
      description: 'Academic writing tasks that assess your ability to present and justify an opinion, compare data, and analyze problems.',
      questionTypes: [
        {
          name: 'Task 1: Data Description (150 words)',
          description: 'Describe and analyze visual information like graphs, charts, diagrams, or tables in academic style'
        },
        {
          name: 'Task 2: Essay Writing (250 words)',
          description: 'Write an essay in response to a point of view, argument, or academic topic with examples and evidence'
        }
      ]
    },
    {
      name: 'Listening',
      color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      icon: <Headphones className="size-6" />,
      duration: '30 minutes',
      passages: '4 recordings',
      questions: '40 questions',
      description: 'A variety of recordings including conversations, monologues, and academic lectures with different accents.',
      questionTypes: [
        { name: 'Multiple Choice', description: 'Choose the correct answer from given options' },
        { name: 'Matching', description: 'Match a list of statements to options in a box' },
        { name: 'Plan/Map/Diagram Labelling', description: 'Complete labels on a visual using words from the recording' },
        { name: 'Form/Note/Table Completion', description: 'Fill in missing information in forms, notes, or tables' },
        { name: 'Sentence Completion', description: 'Complete sentences using words from the recording' },
        { name: 'Short Answer Questions', description: 'Answer questions using no more than three words from the recording' }
      ]
    },
    {
      name: 'Speaking',
      color: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      icon: <MessageSquare className="size-6" />,
      duration: '11-14 minutes',
      passages: '3 parts',
      questions: 'Face-to-face',
      description: 'A face-to-face interview with an examiner covering familiar topics, personal experiences, and abstract concepts.',
      questionTypes: [
        {
          name: 'Part 1: Introduction & Interview (4-5 mins)',
          description: 'General questions about yourself, home, family, work, studies, and familiar topics'
        },
        {
          name: 'Part 2: Long Turn/Cue Card (3-4 mins)',
          description: 'Speak for 1-2 minutes on a given topic after 1 minute of preparation time'
        },
        {
          name: 'Part 3: Two-way Discussion (4-5 mins)',
          description: 'Discussion of abstract ideas and issues related to the topic in Part 2'
        }
      ]
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-balance text-3xl font-bold md:text-4xl mb-4">
            Master All IELTS Academic Question Types
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Comprehensive practice for all four skills with authentic question formats.
            Our platform covers every question type you'll encounter in the actual IELTS Academic exam.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {skillSections.map((skill, skillIndex) => (
            <Card
              key={skillIndex}
              className={`p-8 ${skill.color} hover:shadow-xl transition-all duration-300 flex flex-col h-full`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
                    <div className={skill.iconColor}>
                      {skill.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{skill.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border">
                  <Clock className="size-4 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                  <div className="text-sm font-medium">{skill.duration}</div>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border">
                  <BookOpen className="size-4 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                  <div className="text-sm font-medium">{skill.passages}</div>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border">
                  <Target className="size-4 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                  <div className="text-sm font-medium">{skill.questions}</div>
                </div>
              </div>

              {/* Question Types */}
              <div className="space-y-4 flex-grow">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle className="size-5 text-blue-600" />
                  Question Types Covered
                </h4>
                <div className="space-y-3">
                  {skill.questionTypes.map((questionType, questionIndex) => (
                    <div
                      key={questionIndex}
                      className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border border-white/50 dark:border-gray-700/50"
                    >
                      <h5 className="font-medium text-sm mb-1">{questionType.name}</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {questionType.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700/20">
                <Button asChild size="sm" className="w-full">
                  <Link href={`/ielts-academic/dashboard/sections/${skill.name.toLowerCase()}`}>
                    Practice {skill.name} Questions
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Practicing?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Access over 2,500 authentic IELTS Academic practice questions with detailed explanations,
            band score predictions, and personalized study plans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/ielts-academic/dashboard">
                Start Free Practice
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="size-4 text-blue-600" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}