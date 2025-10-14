import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    id: 'sarah',
    quote:
      'Studious was instrumental in helping me achieve Band 8.5 in IELTS Academic. The practice questions were exactly like the real exam and the AI feedback helped me identify my weak areas.',
    highlight: ['Band 8.5 in IELTS Academic'],
    name: 'Sarah M.',
    meta: 'Achieved Band 8.5 Overall',
    avatar: '/images/avatars/sarah.jpg',
  },
  {
    id: 'ahmed',
    quote:
      'The personalized study plan and authentic practice tests on Studious helped me improve from Band 6.0 to Band 7.5 in just 6 weeks. Now I can apply to my dream university in Canada.',
    highlight: ['Band 6.0 to Band 7.5 in just 6 weeks'],
    name: 'Ahmed K.',
    meta: 'Band 7.5 • University of Toronto',
    avatar: '/images/avatars/ahmed.jpg',
  },
  {
    id: 'priya',
    quote:
      'The Writing Task 2 templates and speaking practice sessions were game-changers. I went from struggling with Band 6.0 to confidently achieving Band 8.0 in both sections.',
    highlight: ['Band 8.0 in both sections'],
    name: 'Priya S.',
    meta: 'Band 8.0 Writing & Speaking',
    avatar: '/images/avatars/priya.jpg',
  },
];

export function Testimonials() {
  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Trusted by over 500,000 IELTS candidates worldwide
          </h2>
          <p className="mt-2 text-gray-500">
            Join thousands who achieved their target band scores and secured admission to top universities.
          </p>
        </header>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Card className="h-full border-none shadow-none bg-transparent">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Stars */}
                  <div className="flex space-x-1 mb-4">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <svg
                        key={idx}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-yellow-400"
                      >
                        <path d="M12 .587l3.668 7.431L23.327 9.6l-5.66 5.52L19.335 24 12 19.897 4.665 24l1.668-8.88L.673 9.6l7.659-1.582z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-gray-700 text-sm leading-relaxed flex-1">
                    {renderHighlightedQuote(t.quote, t.highlight)}
                  </blockquote>

                  {/* Profile */}
                  <div className="flex items-center mt-6">
                    <Avatar className="h-10 w-10">
                      {t.avatar ? (
                        <AvatarImage src={t.avatar} alt={t.name} />
                      ) : (
                        <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900 text-sm">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-500">{t.meta}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Logos */}
        <div className="mt-16 border-t pt-10 text-center">
          <h3 className="text-gray-900 font-medium mb-8">
            Used by students at top schools
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-80">
            {/* Replace placeholders with real logos */}
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="w-24 h-12 flex items-center justify-center grayscale"
              >
                <span className="text-xs text-gray-400">Logo</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function renderHighlightedQuote(quote: string, highlights?: string[]) {
  if (!highlights) return quote;
  let result: React.ReactNode[] = [quote];

  highlights.forEach((h) => {
    result = result.flatMap((part: any, i: number) => {
      if (typeof part !== 'string') return [part];
      const split = part.split(h);
      if (split.length === 1) return [part];
      return split.flatMap((s, j) =>
        j < split.length - 1
          ? [
              s,
              <mark key={i + j} className="bg-yellow-200 px-1">
                {h}
              </mark>,
            ]
          : [s]
      );
    });
  });

  return <>{result}</>;
}
