import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Headphones, MessageSquare, PenTool, CheckCircle, Clock, Target, Mic } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function QuestionTypes() {
  const skillSections = [
    {
      name: 'Speaking & Writing',
      color: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      icon: <Mic className="size-6" />,
      duration: '77-93 minutes',
      passages: 'Combined section',
      questions: '7 task types',
      description: 'Integrated tasks that test speaking and writing skills together using computer-based AI scoring.',
      questionTypes: [
        { name: 'Read Aloud', description: 'Read a text aloud with correct pronunciation, stress, and intonation' },
        { name: 'Repeat Sentence', description: 'Listen and repeat sentences exactly as heard' },
        { name: 'Describe Image', description: 'Describe graphs, charts, images, or diagrams in detail' },
        { name: 'Re-tell Lecture', description: 'Summarize key points from an academic lecture' },
        { name: 'Answer Short Question', description: 'Answer questions with one or a few words' },
        { name: 'Summarize Written Text', description: 'Write a one-sentence summary of a passage (5-75 words)' },
        { name: 'Write Essay', description: 'Write a 200-300 word argumentative essay on a given topic' }
      ]
    },
    {
      name: 'Reading',
      color: 'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800',
      iconColor: 'text-purple-600 dark:text-purple-400',
      icon: <BookOpen className="size-6" />,
      duration: '32-41 minutes',
      passages: '5 task types',
      questions: '15-20 questions',
      description: 'Academic and general reading comprehension tasks testing your ability to understand written English.',
      questionTypes: [
        {
          name: 'Multiple Choice (Single Answer)',
          description: 'Choose one correct answer from multiple options based on the passage'
        },
        {
          name: 'Multiple Choice (Multiple Answers)',
          description: 'Choose all correct answers from multiple options'
        },
        {
          name: 'Re-order Paragraphs',
          description: 'Arrange text boxes in the correct order to form a logical passage'
        },
        {
          name: 'Reading: Fill in the Blanks',
          description: 'Drag and drop words to complete gaps in a reading passage'
        },
        {
          name: 'Reading & Writing: Fill in the Blanks',
          description: 'Complete gaps using dropdown menus with grammatically correct options'
        }
      ]
    },
    {
      name: 'Listening',
      color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      icon: <Headphones className="size-6" />,
      duration: '45-57 minutes',
      passages: '8 task types',
      questions: '12-20 questions',
      description: 'Audio recordings from lectures, conversations, and presentations testing listening comprehension.',
      questionTypes: [
        {
          name: 'Summarize Spoken Text',
          description: 'Write a 50-70 word summary of an audio recording'
        },
        {
          name: 'Multiple Choice (Multiple Answers)',
          description: 'Choose all correct answers based on audio content'
        },
        {
          name: 'Fill in the Blanks',
          description: 'Type missing words while listening to an audio recording'
        },
        {
          name: 'Highlight Correct Summary',
          description: 'Choose the paragraph that best summarizes the audio'
        },
        {
          name: 'Multiple Choice (Single Answer)',
          description: 'Choose one correct answer based on audio content'
        },
        {
          name: 'Select Missing Word',
          description: 'Choose the word that completes the audio recording'
        },
        {
          name: 'Highlight Incorrect Words',
          description: 'Identify words in transcript that differ from audio'
        },
        {
          name: 'Write from Dictation',
          description: 'Type sentences exactly as heard in the audio'
        }
      ]
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-balance text-3xl font-bold md:text-4xl mb-4">
            Master All PTE Academic Question Types
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Complete preparation for all three PTE sections with AI-powered scoring and authentic question formats.
            Our platform replicates the exact PTE Academic test environment and scoring algorithms.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
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
                  <CheckCircle className="size-5 text-orange-600" />
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
                  <Link href={`/pte-academic/dashboard/sections/${skill.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    Practice {skill.name} Questions
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* PTE-specific features */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">AI Scoring</div>
            <div className="text-sm text-muted-foreground mt-1">Exact replica of PTE&apos;s automated scoring</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">3 Hours</div>
            <div className="text-sm text-muted-foreground mt-1">Complete test duration</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">20 Types</div>
            <div className="text-sm text-muted-foreground mt-1">Different question formats</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">Integrated</div>
            <div className="text-sm text-muted-foreground mt-1">Skills tested together</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-2xl border border-orange-100 dark:border-orange-800">
          <h3 className="text-2xl font-bold mb-4">Ready to Master PTE Academic?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Access over 1,500 authentic PTE Academic practice questions with AI-powered scoring,
            real-time feedback, and computer-based test simulation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href="/pte-academic/dashboard">
                Start Free Practice
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="size-4 text-orange-600" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}