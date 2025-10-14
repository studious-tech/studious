import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Atom, Microscope, Dna, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function NEET() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Medical Entrance
              </Badge>
              <h2 className="text-4xl font-bold lg:text-5xl">NEET</h2>
            </div>

            <p className="text-xl text-muted-foreground">
              Crack India&apos;s toughest medical entrance exam with our
              comprehensive NEET preparation platform. Master Physics,
              Chemistry, and Biology with AI-powered practice and detailed
              explanations.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Atom className="size-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Physics</h3>
                  <p className="text-sm text-muted-foreground">
                    Mechanics to Modern Physics
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Calculator className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Chemistry</h3>
                  <p className="text-sm text-muted-foreground">
                    Organic, Inorganic & Physical
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Dna className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Biology</h3>
                  <p className="text-sm text-muted-foreground">
                    Botany & Zoology
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Microscope className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Mock Tests</h3>
                  <p className="text-sm text-muted-foreground">
                    Full-length practice
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="#">Start NEET Prep</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#">Previous Year Papers</Link>
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
                  studious.ai/neet/biology-practice
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-red-900 dark:text-red-100">
                      Biology - Human Physiology
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      Question 15/45
                    </Badge>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded p-3 mb-3 text-sm">
                    <strong>Q:</strong> Which of the following hormones is
                    responsible for the regulation of blood glucose levels?
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="q1"
                          className="text-red-500"
                        />
                        <span>A) Thyroxine</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="q1"
                          className="text-red-500"
                          defaultChecked
                        />
                        <span>B) Insulin</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="q1"
                          className="text-red-500"
                        />
                        <span>C) Adrenaline</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="q1"
                          className="text-red-500"
                        />
                        <span>D) Growth hormone</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Time remaining: 2:45
                    </span>
                    <Button size="sm">Submit Answer</Button>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    Performance Analytics
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-800 dark:text-green-200">
                        Physics:
                      </span>
                      <span className="font-semibold">78% (35/45)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-800 dark:text-green-200">
                        Chemistry:
                      </span>
                      <span className="font-semibold">82% (37/45)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-800 dark:text-green-200">
                        Biology:
                      </span>
                      <span className="font-semibold">85% (38/45)</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Overall Score:</span>
                        <span className="text-green-600">550/720</span>
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
