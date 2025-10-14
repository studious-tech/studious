import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Mic, Type, BookOpen, Target, Award } from 'lucide-react';
import Link from 'next/link';

export default function PTE() {
  return (
    <section
      id="pte"
      className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded px-3 py-1 text-sm text-gray-600 dark:text-gray-300">
                  studious.ai/pte/speaking-assessment
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      Describe Image Task
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      Score 82
                    </Badge>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded p-3 mb-3">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                      <div className="text-center">
                        <Monitor className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Bar Chart: Smartphone Usage by Age Group
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-600 rounded p-3 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Your Response</span>
                      <span className="text-xs text-muted-foreground">
                        38 seconds
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      &quot;The bar chart illustrates the percentage of
                      smartphone usage across different age groups. Overall,
                      younger people tend to use smartphones more frequently
                      than older individuals...&quot;
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                    AI Detailed Assessment
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-indigo-800 dark:text-indigo-200">
                        Content
                      </span>
                      <span className="font-semibold">85</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-800 dark:text-indigo-200">
                        Oral Fluency
                      </span>
                      <span className="font-semibold">80</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-800 dark:text-indigo-200">
                        Pronunciation
                      </span>
                      <span className="font-semibold">82</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-800 dark:text-indigo-200">
                        Spoken Discourse
                      </span>
                      <span className="font-semibold">78</span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-white dark:bg-gray-700 rounded">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm">
                        Overall Communication Score:
                      </strong>
                      <span className="text-blue-600 font-bold text-lg">
                        82
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-600 text-white">Pearson Test</Badge>
              <h2 className="text-4xl font-bold lg:text-5xl">
                PTE Preparation
              </h2>
            </div>

            <p className="text-xl text-muted-foreground">
              Master the PTE Academic test with our AI-powered practice
              platform. Get real-time feedback and score predictions for all
              question types.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-1">
                  <Mic className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Speaking Tasks</h3>
                  <p className="text-sm text-muted-foreground">
                    All 5 question types with AI scoring
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mt-1">
                  <Type className="size-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Writing Tasks</h3>
                  <p className="text-sm text-muted-foreground">
                    Summarize & Essay with feedback
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mt-1">
                  <BookOpen className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Reading Skills</h3>
                  <p className="text-sm text-muted-foreground">
                    5+ question formats
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg mt-1">
                  <Monitor className="size-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Listening Tests</h3>
                  <p className="text-sm text-muted-foreground">
                    All 8 question types
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="px-8">
                <Link href="/pte-academic">Start PTE Practice</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link href="/pte-academic">View Sample Test</Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Target className="size-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">79+ Score Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="size-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">92% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
