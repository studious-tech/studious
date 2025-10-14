import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/query-providers';
import { AuthProvider } from '@/providers/auth-provider';
import { Toaster } from 'sonner';
import { Suspense } from 'react';
import ErrorToastHandler from '@/components/common/error-toast-handler';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Studious - AI-Powered Learning & Exam Preparation Platform',
  description:
    'Comprehensive AI-powered online learning platform for PTE, IELTS, UCT, medical entrance tests, and more. Practice with realistic simulations, get instant feedback, and achieve your academic goals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <Toaster position="top-right" />
        <Suspense fallback={null}>
          <ErrorToastHandler />
        </Suspense>
      </body>
    </html>
  );
}
