'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { GridPattern } from '@/components/ui/grid-pattern';
import { MessageCircle } from 'lucide-react';

type Testimonial = {
  name: string;
  role: string;
  image: string;
  company: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      'Studious Prep helped me improve my IELTS score from 6.0 to 7.5 in just 3 months. The AI feedback on my speaking was incredibly detailed and helpful.',
    name: 'Sarah Johnson',
    role: 'Medical Student',
    company: 'University of Melbourne',
    image: 'https://randomuser.me/api/portraits/women/32.jpg',
  },
  {
    quote:
      'The PTE practice tests are so realistic that I felt completely prepared on exam day. I scored 79 overall - exactly what I needed for my visa application.',
    name: 'Michael Chen',
    role: 'Engineering Graduate',
    company: 'University of Sydney',
    image: 'https://randomuser.me/api/portraits/men/33.jpg',
  },
  {
    quote:
      'As a non-native English speaker, I struggled with writing tasks. The personalized study plan and detailed feedback helped me improve my score significantly.',
    name: 'Priya Sharma',
    role: 'Business Analyst',
    company: 'Deloitte',
    image: 'https://randomuser.me/api/portraits/women/34.jpg',
  },
  {
    quote:
      'The UCAT preparation materials were comprehensive and well-structured. I scored in the 90th percentile and got into my dream medical school.',
    name: 'David Wilson',
    role: 'Medical School Student',
    company: 'University of Queensland',
    image: 'https://randomuser.me/api/portraits/men/35.jpg',
  },
  {
    quote:
      'I appreciated the adaptive learning feature that focused on my weak areas. It made my study time much more efficient and effective.',
    name: 'Emma Rodriguez',
    role: 'Nursing Student',
    company: "King's College London",
    image: 'https://randomuser.me/api/portraits/women/36.jpg',
  },
  {
    quote:
      'The pronunciation training module was a game-changer for my speaking score. My confidence improved dramatically after using it regularly.',
    name: 'Kenji Tanaka',
    role: 'MBA Candidate',
    company: 'INSEAD',
    image: 'https://randomuser.me/api/portraits/men/37.jpg',
  },
  {
    quote:
      'The performance analytics helped me track my progress and stay motivated. I could see clear improvements in each section over time.',
    name: 'Fatima Al-Rashid',
    role: 'PhD Candidate',
    company: 'Cambridge University',
    image: 'https://randomuser.me/api/portraits/women/38.jpg',
  },
  {
    quote:
      'I tried several prep platforms, but Studious stood out with its AI-powered feedback and realistic practice tests. Worth every penny!',
    name: 'James Parker',
    role: 'Immigration Lawyer',
    company: 'Parker & Associates',
    image: 'https://randomuser.me/api/portraits/men/39.jpg',
  },
];

export default function Testimonials() {
  return (
    <section className="relative w-full pt-10 pb-20 px-4">
      <div aria-hidden className="absolute inset-0 isolate z-0 contain-strict">
        <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full" />
        <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] -rotate-45 rounded-full" />
        <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 rounded-full" />
      </div>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:text-6xl xl:font-extrabold">
            Real Results, Real Voices
          </h2>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl mx-auto">
            See how students are achieving their dream scores with our platform
            — real stories, real impact, real success.
          </p>
        </div>
        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map(({ name, role, company, quote, image }, index) => (
            <motion.div
              initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
              whileInView={{
                filter: 'blur(0px)',
                translateY: 0,
                opacity: 1,
              }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index + 0.1, duration: 0.8 }}
              key={index}
              className="border-foreground/25 relative grid grid-cols-[auto_1fr] gap-x-4 overflow-hidden border border-dashed p-5 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
            >
              <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
                <div className="from-foreground/5 to-foreground/2 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
                  <GridPattern
                    width={25}
                    height={25}
                    x={-12}
                    y={4}
                    strokeDasharray="3"
                    className="stroke-foreground/20 absolute inset-0 h-full w-full mix-blend-overlay"
                  />
                </div>
              </div>
              <img
                alt={name}
                src={image}
                loading="lazy"
                className="size-10 rounded-full"
              />
              <div>
                <div className="-mt-0.5 -space-y-0.5">
                  <p className="text-sm md:text-base font-semibold">{name}</p>
                  <span className="text-muted-foreground block text-[11px] font-light tracking-tight">
                    {role} at {company}
                  </span>
                </div>
                <blockquote className="mt-3">
                  <p className="text-foreground text-sm font-light tracking-wide">
                    "{quote}"
                  </p>
                </blockquote>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
