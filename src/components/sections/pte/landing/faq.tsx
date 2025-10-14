import { cn } from '@/lib/utils';
import { useState } from 'react';
import React from 'react';

const Faq = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const faqs = [
    {
      question: 'How does your PTE practice platform replicate the real test?',
      answer:
        'Our platform uses the same AI algorithms and computer interface as the official PTE Academic test. We replicate the exact timing, question formats, and scoring system used by Pearson, giving you authentic practice experience.',
    },
    {
      question: 'Do you cover all three PTE Academic sections?',
      answer:
        'Yes! We provide comprehensive practice for Speaking & Writing (combined section), Reading, and Listening. Each section includes all official question types like Read Aloud, Describe Image, Re-order Paragraphs, and Summarize Spoken Text.',
    },
    {
      question: 'How accurate is your AI scoring system?',
      answer:
        'Our AI scoring system has 97% accuracy correlation with official PTE scores. It evaluates the same criteria as PTE Academic: content, oral fluency, pronunciation, vocabulary, grammar, and written discourse.',
    },
    {
      question: 'Can I practice PTE speaking tasks with real-time feedback?',
      answer:
        'Absolutely! Our platform provides instant AI-powered feedback on pronunciation, fluency, grammar, and content for all speaking tasks including Read Aloud, Repeat Sentence, Describe Image, and Re-tell Lecture.',
    },
    {
      question: 'How many PTE practice questions are available?',
      answer:
        'We offer over 1,500 authentic PTE Academic practice questions across all sections. This includes 200+ speaking tasks, 300+ writing prompts, 400+ reading passages, and 600+ listening recordings, all updated regularly.',
    },
    {
      question: 'Do you provide PTE mock tests with score prediction?',
      answer:
        'Yes! We offer full-length PTE Academic mock tests that simulate the exact test conditions. After completion, you receive detailed score predictions, performance analytics, and personalized study recommendations.',
    },
  ];
  return (
    <div className="py-20 bg-white">
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start justify-center gap-8 px-4 md:px-0">
        <img
          className="max-w-sm w-full rounded-xl h-auto"
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=830&h=844&auto=format&fit=crop"
          alt="Student taking PTE Academic computer-based test"
        />
        <div>
          <p className="text-orange-600 text-sm font-medium">PTE FAQs</p>
          <h1 className="text-3xl font-semibold">Got Questions About PTE Academic?</h1>
          <p className="text-sm text-slate-500 mt-2 pb-4">
            Find answers to the most common questions about PTE Academic preparation,
            our AI-powered platform features, and how to achieve your target score.
          </p>
          {faqs.map((faq, index) => (
            <div
              className="border-b border-slate-200 py-4 cursor-pointer"
              key={index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">{faq.question}</h3>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${
                    openIndex === index ? 'rotate-180' : ''
                  } transition-all duration-500 ease-in-out`}
                >
                  <path
                    d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                    stroke="#1D293D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p
                className={`text-sm text-slate-500 transition-all duration-500 ease-in-out max-w-md ${
                  openIndex === index
                    ? 'opacity-100 max-h-[300px] translate-y-0 pt-4'
                    : 'opacity-0 max-h-0 -translate-y-2'
                }`}
              >
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;