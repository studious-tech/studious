import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PenTool,
  BookOpen,
  Headphones,
  MessageSquare,
  Target,
  Award,
} from 'lucide-react';
import Link from 'next/link';

export default function IELTS() {
  return (
    <section
      id="ielts"
      className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-green-600 text-white">Global Standard</Badge>
              <h2 className="text-4xl font-bold lg:text-5xl">
                IELTS Preparation
              </h2>
            </div>

            <p className="text-xl text-muted-foreground">
              Achieve your target IELTS band score with our comprehensive
              preparation system. Practice all four modules with expert-level AI
              feedback and band score predictions.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mt-1">
                  <PenTool className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Writing Tasks</h3>
                  <p className="text-sm text-muted-foreground">
                    Task 1 & 2 with AI scoring
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-1">
                  <BookOpen className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Reading Skills</h3>
                  <p className="text-sm text-muted-foreground">
                    Academic & General Training
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mt-1">
                  <Headphones className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Listening Tests</h3>
                  <p className="text-sm text-muted-foreground">
                    All 6 question types
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mt-1">
                  <MessageSquare className="size-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Speaking Practice</h3>
                  <p className="text-sm text-muted-foreground">
                    Parts 1, 2 & 3 with AI feedback
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="px-8">
                <Link href="/ielts-academic">Start IELTS Practice</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link href="/ielts-academic">View Sample Test</Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Target className="size-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">Band 8+ Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="size-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">95% Success Rate</span>
              </div>
            </div>
          </div>

          <div className="relative order-2 lg:order-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded px-3 py-1 text-sm text-gray-600 dark:text-gray-300">
                  studious.ai/ielts/writing-assessment
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      Writing Task 2 - Essay Assessment
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      Band 7.5
                    </Badge>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded p-3 mb-3 text-sm">
                    <strong>Question:</strong> Some people believe that
                    technology has made our lives more complicated. To what
                    extent do you agree or disagree?
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-600 rounded p-3 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Your Essay Response</span>
                      <span className="text-xs text-muted-foreground">
                        267 words
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      In today&apos;s digital era, technology has become an
                      integral part of our daily existence. While critics argue
                      that it has complicated our lives, I firmly believe that
                      technology has simplified many aspects of modern living...
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    AI Detailed Assessment
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-200">
                        Task Achievement
                      </span>
                      <span className="font-semibold">7.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-200">
                        Coherence & Cohesion
                      </span>
                      <span className="font-semibold">7.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-200">
                        Lexical Resource
                      </span>
                      <span className="font-semibold">8.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-200">
                        Grammatical Range
                      </span>
                      <span className="font-semibold">7.5</span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-white dark:bg-gray-700 rounded">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm">Predicted Band Score:</strong>
                      <span className="text-green-600 font-bold text-lg">
                        7.5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
