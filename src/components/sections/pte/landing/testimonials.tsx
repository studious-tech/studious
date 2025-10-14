import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    id: 'rajesh',
    quote:
      'Studious completely transformed my PTE preparation. The AI scoring system helped me understand exactly where I was losing points. Improved from 58 to 85 points in just 6 weeks!',
    highlight: ['58 to 85 points in just 6 weeks'],
    name: 'Rajesh K.',
    meta: 'Achieved 85 Points Overall',
    avatar: '/images/avatars/rajesh.jpg',
  },
  {
    id: 'monica',
    quote:
      'The integrated speaking and writing practice sessions were game-changing. The real-time feedback on pronunciation and fluency helped me gain confidence for the actual test.',
    highlight: ['real-time feedback on pronunciation and fluency'],
    name: 'Monica L.',
    meta: 'Score: 79 • University of Melbourne',
    avatar: '/images/avatars/monica.jpg',
  },
  {
    id: 'david',
    quote:
      'Finally found a platform that truly replicates the PTE computer interface. The listening section practice with automated scoring was exactly like the real exam.',
    highlight: ['truly replicates the PTE computer interface'],
    name: 'David C.',
    meta: 'Score: 82 • Immigration Success',
    avatar: '/images/avatars/david.jpg',
  },
];

export function Testimonials() {
  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Trusted by over 300,000 PTE candidates worldwide
          </h2>
          <p className="mt-2 text-gray-500">
            Join thousands who achieved their target scores and secured their dreams through PTE Academic success.
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

        {/* University Logos */}
        <div className="mt-16 border-t pt-10 text-center">
          <h3 className="text-gray-900 font-medium mb-8">
            Students accepted at top institutions worldwide
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-80">
            {/* Replace placeholders with real university logos */}
            {[
              'University of Melbourne',
              'Australian National University',
              'University of Sydney',
              'University of Toronto',
              'University of British Columbia',
              'University of Auckland',
              'Massey University',
              'Victoria University'
            ].map((university, idx) => (
              <div
                key={idx}
                className="w-24 h-12 flex items-center justify-center grayscale text-xs text-gray-400 text-center"
              >
                {university}
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
              <mark key={i + j} className="bg-orange-200 px-1">
                {h}
              </mark>,
            ]
          : [s]
      );
    });
  });

  return <>{result}</>;
}