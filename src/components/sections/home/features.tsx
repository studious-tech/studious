import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { Brain, Mic, BarChart3, Zap, Volume2, PenTool } from 'lucide-react';

export default function Features() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/20" id="features">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-balance text-3xl font-semibold md:text-4xl">
            Why Students Choose Studious Prep
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Our comprehensive platform provides everything you need to excel in your exams with proven results.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <IntegrationCard
            title="AI-Powered Scoring"
            description="Get instant, accurate band scores for speaking and writing tasks with detailed feedback that identifies strengths and areas for improvement."
          >
            <Brain />
          </IntegrationCard>

          <IntegrationCard
            title="Real Exam Simulations"
            description="Practice with authentic test environments that mirror actual exam conditions, helping you build confidence and reduce test-day anxiety."
          >
            <BarChart3 />
          </IntegrationCard>

          <IntegrationCard
            title="Personalized Study Plans"
            description="Receive customized learning paths based on your current level and target score, focusing on areas where you need the most improvement."
          >
            <Zap />
          </IntegrationCard>

          <IntegrationCard
            title="Comprehensive Question Bank"
            description="Access thousands of practice questions covering all sections and question types for IELTS, PTE, and UCAT with detailed explanations."
          >
            <BookOpen />
          </IntegrationCard>

          <IntegrationCard
            title="Performance Analytics"
            description="Track your progress with detailed analytics, identify weak areas, and monitor improvement over time with our advanced reporting system."
          >
            <BarChart3 />
          </IntegrationCard>

          <IntegrationCard
            title="Expert-Curated Content"
            description="Learn from materials developed by certified examiners and education experts with years of experience in test preparation."
          >
            <PenTool />
          </IntegrationCard>
        </div>
      </div>
    </section>
  );
}

const IntegrationCard = ({
  title,
  description,
  children,
  link = '#',
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  link?: string;
}) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative flex-grow">
        <div className="*:size-10 text-blue-600 dark:text-blue-400">
          {children}
        </div>

        <div className="space-y-2 py-6">
          <h3 className="text-base font-medium">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

        <div className="flex gap-3 border-t border-dashed pt-6 mt-auto">
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="gap-1 pr-2 shadow-none"
          >
            <Link href={link}>
              Learn More
              <ChevronRight className="ml-0 !size-3.5 opacity-50" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
