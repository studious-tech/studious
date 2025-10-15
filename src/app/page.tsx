import Features from '@/components/sections/home/features';
import HeroSection from '@/components/sections/home/hero-section';
import ExamQuestionTypes from '@/components/sections/home/exam-question-types';
import Testimonials from '@/components/sections/home/testimonials';
import MainLayout from './main-layout';
import CTA from '@/components/sections/home/cta';
import ScrollRevealExams from '@/components/sections/home/scroll-reveal-exams';
import LiveStats from '@/components/sections/home/live-stats';

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />

      {/* Platform Stats */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Join Thousands of Successful Students</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform has helped students worldwide achieve their target scores and reach their academic goals
            </p>
          </div>
          <LiveStats />
        </div>
      </section>

      <Features />
      <ScrollRevealExams />
      <ExamQuestionTypes />
      <Testimonials />
      <CTA />
    </MainLayout>
  );
}
