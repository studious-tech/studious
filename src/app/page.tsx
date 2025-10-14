import Features from '@/components/sections/home/features';
import HeroSection from '@/components/sections/home/hero-section';
import ExamQuestionTypes from '@/components/sections/home/exam-question-types';
import Testimonials from '@/components/sections/home/testimonials';
import MainLayout from './main-layout';
import CTA from '@/components/sections/home/cta';
import ScrollRevealExams from '@/components/sections/home/scroll-reveal-exams';

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <Features />
      <ScrollRevealExams />
      <ExamQuestionTypes />
      <Testimonials />
      <CTA />
    </MainLayout>
  );
}
