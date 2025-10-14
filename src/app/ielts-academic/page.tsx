'use client';

import EnhancedHeader from '@/components/common/layout/enhanced-header';
import Footer from '@/components/common/layout/footer';
import HeroSection from '@/components/sections/ielts/landing/hero-section';
import { Features } from '@/components/sections/ielts/landing/features';
import QuestionTypes from '@/components/sections/ielts/landing/question-types';
import { Testimonials } from '@/components/sections/ielts/landing/testimonials';
import { Pricing } from '@/components/sections/ielts/landing/single-pricing-card-1';
import Faq from '@/components/sections/ielts/landing/faq';

export default function IELTSLandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <EnhancedHeader />
      <main>
        <HeroSection />
        <Features />
        <QuestionTypes />
        <Testimonials />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
