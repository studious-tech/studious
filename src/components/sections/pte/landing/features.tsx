import { FeatureSteps } from '@/components/common/landing/feature-section';

const features = [
  {
    step: 'Step 1',
    title: 'Learn AI-Powered Scoring',
    content: 'Understand how PTE Academic uses AI to score your responses. Master the computer-based format with our exact replica of the official scoring system.',
    image:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    step: 'Step 2',
    title: 'Practice Integrated Skills',
    content:
      'Master PTE&apos;s unique integrated approach where skills overlap. Practice Speaking & Writing, Reading, and Listening with authentic question formats.',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    step: 'Step 3',
    title: 'Perfect Your Performance',
    content:
      'Get real-time AI feedback on pronunciation, fluency, grammar, and content. Track your progress and achieve consistent high scores.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

export function Features() {
  return (
    <FeatureSteps
      features={features}
      title="Your Path to PTE Success"
      autoPlayInterval={5000}
      imageHeight="h-[500px]"
    />
  );
}