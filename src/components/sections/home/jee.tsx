import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Zap, Atom, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function JEE() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded px-3 py-1 text-sm text-gray-600 dark:text-gray-300">
                  studious.ai/jee/mathematics-advanced
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">
                      Mathematics - Calculus
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      JEE Advanced
                    </Badge>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded p-3 mb-3 text-sm">
                    <strong>Q:</strong> Find the area bounded by the curves y =
                    x² and y = 2x - x²
                    <div className="mt-3 bg-gray-50 dark:bg-gray-600 rounded p-2">
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        Step-by-step solution:
                        <br />
                        1. Find intersection points: x² = 2x - x²
                        <br />
                        2. Solve: 2x² - 2x = 0 → x = 0, 1
                        <br />
                        3. Area = ∫₀¹ (2x - x² - x²) dx = ∫₀¹ (2x - 2x²) dx
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Difficulty: Advanced
                    </span>
                    <Button size="sm" variant="outline">
                      Show Solution
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    AI Performance Insights
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-200">
                        Mathematics:
                      </span>
                      <span className="font-semibold">92% accuracy</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-200">
                        Physics:
                      </span>
                      <span className="font-semibold">88% accuracy</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800 dark:text-blue-200">
                        Chemistry:
                      </span>
                      <span className="font-semibold">85% accuracy</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Predicted Rank:</span>
                        <span className="text-green-600">AIR 2,500</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                Engineering Gateway
              </Badge>
              <h2 className="text-4xl font-bold lg:text-5xl">JEE</h2>
            </div>

            <p className="text-xl text-muted-foreground">
              Secure your seat in India&apos;s top engineering colleges with our
              comprehensive JEE Main & Advanced preparation. Master complex
              problem-solving with step-by-step AI guidance.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <Calculator className="size-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Mathematics</h3>
                  <p className="text-sm text-muted-foreground">
                    Calculus to Algebra
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Atom className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Physics</h3>
                  <p className="text-sm text-muted-foreground">
                    Mechanics to Optics
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Zap className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Chemistry</h3>
                  <p className="text-sm text-muted-foreground">
                    All three branches
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Rank Predictor</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered analysis
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="#">Start JEE Prep</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#">Take Mock Test</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
