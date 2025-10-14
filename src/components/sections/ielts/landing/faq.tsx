import { cn } from '@/lib/utils';
import { useState } from 'react';
import React from 'react';

const Faq = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const faqs = [
    {
      question: 'How is your IELTS practice different from other platforms?',
      answer:
        'Our platform uses authentic IELTS Academic questions and provides AI-powered feedback that analyzes your responses in real-time. We offer detailed explanations for every answer, personalized study plans, and band score predictions to help you track your progress effectively.',
    },
    {
      question: 'Do you provide practice for all four IELTS skills?',
      answer:
        'Yes! We cover all four IELTS Academic skills: Reading (40 questions), Writing (Task 1 & 2), Listening (40 questions), and Speaking (Parts 1, 2, & 3). Each section includes authentic question types you&apos;ll encounter in the actual exam.',
    },
    {
      question: 'How accurate are your band score predictions?',
      answer:
        'Our AI-powered band score predictions are highly accurate, with 95% correlation to actual IELTS scores. The system analyzes your performance across all criteria used by official IELTS examiners, including task achievement, coherence, lexical resource, and grammatical range.',
    },
    {
      question: 'Can I practice IELTS Speaking with your platform?',
      answer:
        'Absolutely! Our Speaking practice includes all three parts of the IELTS Speaking test. You can record your responses, receive detailed feedback on pronunciation, fluency, vocabulary, and grammar, plus access to sample answers from Band 7-9 responses.',
    },
    {
      question: 'How many practice questions do you have?',
      answer:
        'We have over 2,500 authentic IELTS Academic practice questions, including 500+ Reading passages, 400+ Writing tasks, 600+ Listening recordings, and 1,000+ Speaking questions. All questions are regularly updated to reflect current exam trends.',
    },
    {
      question: 'Do you offer mock tests and exam simulation?',
      answer:
        'Yes! We provide full-length mock tests that replicate the actual IELTS Academic exam conditions, including timing, question formats, and difficulty levels. After each test, you receive detailed performance analytics and improvement recommendations.',
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
          src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=830&h=844&auto=format&fit=crop"
          alt="Student preparing for IELTS exam"
        />
        <div>
          <p className="text-blue-600 text-sm font-medium">IELTS FAQs</p>
          <h1 className="text-3xl font-semibold">Got Questions About IELTS?</h1>
          <p className="text-sm text-slate-500 mt-2 pb-4">
            Find answers to the most common questions about IELTS Academic preparation,
            our platform features, and how to achieve your target band score.
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
