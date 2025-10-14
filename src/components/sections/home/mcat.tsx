import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, BookOpen, FlaskConical, Users } from 'lucide-react';
import Link from 'next/link';

export default function MCAT() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                US/Canada Medical
              </Badge>
              <h2 className="text-4xl font-bold lg:text-5xl">MCAT</h2>
            </div>

            <p className="text-xl text-muted-foreground">
              Excel in the Medical College Admission Test with our comprehensive
              preparation platform. Master all four sections with AI-powered
              practice and detailed performance analytics.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <FlaskConical className="size-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Chemical Sciences</h3>
                  <p className="text-sm text-muted-foreground">
                    General & Organic Chemistry
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Brain className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Biological Sciences</h3>
                  <p className="text-sm text-muted-foreground">
                    Biology & Biochemistry
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BookOpen className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Critical Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    CARS section prep
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Users className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Psychology</h3>
                  <p className="text-sm text-muted-foreground">
                    Behavioral Sciences
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="#">Start MCAT Prep</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#">Full-Length Practice</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded px-3 py-1 text-sm text-gray-600 dark:text-gray-300">
                  studious.ai/mcat/biological-sciences
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                      Biological Sciences
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      Passage 3/15
                    </Badge>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded p-3 mb-3 text-sm">
                    <strong>Passage:</strong> Researchers investigated the role
                    of mitochondrial dysfunction in neurodegenerative
                    diseases...
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-600 rounded text-xs">
                      <strong>Q1:</strong> Based on the passage, which of the
                      following best explains the relationship between ATP
                      production and neuronal cell death?
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Time: 8:45 remaining
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Previous
                      </Button>
                      <Button size="sm">Next</Button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Section Scores
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-200">
                        Chemical Sciences:
                      </span>
                      <span className="font-semibold">128/132</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-200">
                        CARS:
                      </span>
                      <span className="font-semibold">126/132</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-200">
                        Biological Sciences:
                      </span>
                      <span className="font-semibold">130/132</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-200">
                        Psychology:
                      </span>
                      <span className="font-semibold">127/132</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total Score:</span>
                        <span className="text-green-600">511/528</span>
                      </div>
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
