import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function ExamTypes() {
  const examTypes = [
    {
      category: 'English Proficiency',
      exams: [
        {
          name: 'PTE Academic',
          description: 'Pearson Test of English for academic purposes',
          duration: '3 hours',
          popularity: 'Most Popular',
          features: ['Speaking', 'Writing', 'Reading', 'Listening'],
          color:
            'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
        },
        {
          name: 'IELTS',
          description: 'International English Language Testing System',
          duration: '2h 45m',
          popularity: 'High Demand',
          features: ['Academic', 'General Training', 'Speaking', 'Writing'],
          color:
            'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
        },
        {
          name: 'TOEFL iBT',
          description: 'Test of English as a Foreign Language',
          duration: '3 hours',
          popularity: 'University Standard',
          features: ['Reading', 'Listening', 'Speaking', 'Writing'],
          color:
            'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800',
        },
      ],
    },
    {
      category: 'Medical Entrance',
      exams: [
        {
          name: 'NEET',
          description: 'National Eligibility cum Entrance Test',
          duration: '3h 20m',
          popularity: 'India&apos;s Largest',
          features: ['Physics', 'Chemistry', 'Biology', 'MCQs'],
          color:
            'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800',
        },
        {
          name: 'MCAT',
          description: 'Medical College Admission Test',
          duration: '7h 30m',
          popularity: 'US/Canada',
          features: ['Critical Analysis', 'Biology', 'Chemistry', 'Physics'],
          color:
            'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800',
        },
      ],
    },
    {
      category: 'Engineering & Graduate',
      exams: [
        {
          name: 'JEE Main/Advanced',
          description: 'Joint Entrance Examination',
          duration: '3 hours',
          popularity: 'Engineering Gateway',
          features: ['Mathematics', 'Physics', 'Chemistry', 'Problem Solving'],
          color:
            'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800',
        },
        {
          name: 'GRE',
          description: 'Graduate Record Examinations',
          duration: '3h 45m',
          popularity: 'Graduate School',
          features: ['Verbal', 'Quantitative', 'Analytical Writing'],
          color:
            'bg-teal-50 border-teal-200 dark:bg-teal-950/20 dark:border-teal-800',
        },
      ],
    },
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-balance text-3xl font-semibold md:text-4xl mb-4">
            Practice for Any Exam
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From English proficiency tests to medical and engineering entrance
            exams, we&apos;ve got comprehensive preparation materials for all
            major competitive exams.
          </p>
        </div>

        <div className="space-y-12">
          {examTypes.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-xl font-semibold mb-6 text-center">
                {category.category}
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {category.exams.map((exam, examIndex) => (
                  <Card
                    key={examIndex}
                    className={`p-6 ${exam.color} hover:shadow-lg transition-all duration-200`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-semibold">{exam.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {exam.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {exam.popularity}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="size-4" />
                          {exam.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="size-4" />
                          Practice Tests
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {exam.features.map((feature, featureIndex) => (
                          <Badge
                            key={featureIndex}
                            variant="outline"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <Button asChild className="w-full" size="sm">
                        <Link
                          href="#"
                          className="flex items-center justify-center gap-2"
                        >
                          Start Practicing
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
            <Link href="#" className="flex items-center gap-2">
              View All Exams
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
