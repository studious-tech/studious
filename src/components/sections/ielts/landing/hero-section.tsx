'use client';
import { Button } from '@/components/ui/button';
import { Mail, SendHorizonal, BookOpen, Headphones } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HeroSection() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const redirectUrl = `/ielts-academic/dashboard?email=${encodeURIComponent(email)}`;
    router.push(redirectUrl);
  };

  return (
    <>
      <main>
        <section className="min-h-screen overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-28 lg:py-20 min-h-screen flex items-center">
            <div className="lg:flex lg:items-center lg:gap-12 w-full">
              <div className="relative z-10 mx-auto max-w-xl text-center lg:ml-0 lg:w-1/2 lg:text-left">
                <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 px-3 py-1 rounded-full mb-6">
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    IELTS Academic Prep
                  </span>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    500,000+ successful candidates
                  </span>
                </div>

                <h1 className="mt-4 text-balance text-4xl font-bold md:text-5xl xl:text-6xl">
                  Master <span className="text-blue-600">IELTS Academic</span> with Confidence
                </h1>
                <p className="mt-6 text-lg text-muted-foreground">
                  Comprehensive IELTS Academic preparation with authentic practice tests,
                  AI-powered feedback, and expert strategies. Achieve your target band score with our proven system.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" asChild className="px-8 bg-blue-600 hover:bg-blue-700">
                    <Link href="/ielts-academic/dashboard">
                      <BookOpen className="mr-2 size-5" />
                      Start Practice
                    </Link>
                  </Button>
                  <Button size="lg" asChild variant="outline" className="px-8">
                    <Link href="/ielts-academic/dashboard/practice">
                      <Headphones className="mr-2 size-5" />
                      Take Mock Test
                    </Link>
                  </Button>
                </div>

                <div className="mt-10">
                  <form
                    onSubmit={onSubmit}
                    className="mx-auto max-w-md lg:ml-0"
                  >
                    <div className="bg-background has-[input:focus]:ring-blue-200 relative grid grid-cols-[1fr_auto] items-center rounded-[calc(var(--radius)+0.75rem)] border pr-3 shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
                      <Mail className="text-caption pointer-events-none absolute inset-y-0 left-5 my-auto size-5" />
                      <input
                        placeholder="Enter your email to start IELTS prep"
                        className="h-14 w-full bg-transparent pl-12 focus:outline-none"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                      <div className="md:pr-1.5 lg:pr-0">
                        <Button
                          aria-label="Get started with IELTS prep"
                          className="rounded-xl bg-blue-600 hover:bg-blue-700"
                        >
                          <span className="hidden md:block">Get Started</span>
                          <SendHorizonal
                            className="relative mx-auto size-5 md:hidden"
                            strokeWidth={2}
                          />
                        </Button>
                      </div>
                    </div>
                  </form>
                  <p className="mt-3 text-sm text-muted-foreground text-center lg:text-left">
                    Join 500,000+ students who achieved their target band score
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 -mx-4 rounded-3xl p-3 lg:col-span-3">
              <div className="relative h-full">
                <div className="bg-radial-[at_65%_25%] to-background z-1 -inset-17 absolute from-transparent to-40%"></div>
                <Image
                  className="hidden dark:block object-cover w-full h-full rounded-2xl"
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
                  alt="IELTS students preparing for exam"
                  width={2796}
                  height={2008}
                />
                <Image
                  className="dark:hidden object-cover w-full h-full rounded-2xl"
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
                  alt="IELTS students preparing for exam"
                  width={2796}
                  height={2008}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}