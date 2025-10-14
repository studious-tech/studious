'use client';

import EnhancedHeaderDynamic from '@/components/common/layout/enhanced-header-dynamic';
import Footer from '@/components/common/layout/footer';
import HeroSection from '@/components/sections/pte/landing/hero-section';
import { Features } from '@/components/sections/pte/landing/features';
import QuestionTypes from '@/components/sections/pte/landing/question-types';
import { Testimonials } from '@/components/sections/pte/landing/testimonials';
import { Pricing } from '@/components/sections/pte/landing/pricing';
import Faq from '@/components/sections/pte/landing/faq';

export default function PTELandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <EnhancedHeaderDynamic />
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
