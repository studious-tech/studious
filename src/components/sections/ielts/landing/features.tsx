import { FeatureSteps } from '@/components/common/landing/feature-section';

const features = [
  {
    step: 'Step 1',
    title: 'Master IELTS Strategies',
    content: 'Learn proven test-taking strategies and techniques from IELTS experts to maximize your band score across all four skills.',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    step: 'Step 2',
    title: 'Practice with Real Questions',
    content:
      'Access thousands of authentic IELTS Academic questions covering Reading, Writing, Listening, and Speaking with detailed explanations.',
    image:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    step: 'Step 3',
    title: 'Get AI-Powered Feedback',
    content:
      'Receive instant, detailed feedback on your performance with personalized recommendations to improve your weakest areas.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

export function Features() {
  return (
    <FeatureSteps
      features={features}
      title="Your Path to IELTS Success"
      autoPlayInterval={5000}
      imageHeight="h-[500px]"
    />
  );
}
