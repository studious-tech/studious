'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { signInWithMagicLink } from '@/actions/auth-actions';
import { useActionState, useState, useEffect } from 'react';
import { ActionState } from '@/lib/auth/middleware';
import { createClient } from '@/supabase/client';
import config from '@/config';
import { Logo } from '@/components/common/logo';
import { Icons } from '@/components/common/icons';
import { toast } from 'sonner';

export function AuthComponent({
  mode = 'signin',
  initialEmail = '',
}: {
  mode?: 'signin' | 'signup';
  initialEmail?: string;
}) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const redirectTo = `${config.domainName}/api/auth/callback`;
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectTo}?redirect=${encodeURIComponent(
            redirect || '/'
          )}`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google. Please try again.');
      setGoogleLoading(false);
    }
    // Don't set loading to false here if successful, as user will be redirected
  };

  const [magicLinkState, magicLinkAction, pending] = useActionState<
    ActionState,
    FormData
  >(signInWithMagicLink, { error: '', success: '' });

  // Show toast notifications for magic link actions
  useEffect(() => {
    if (magicLinkState?.error) {
      toast.error(magicLinkState.error);
    }
    if (magicLinkState?.success) {
      toast.success(magicLinkState.success);
    }
  }, [magicLinkState]);

  // Handle URL error parameter (from failed redirects)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-background flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Gradient orbs - consistent with hero */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-tl from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl opacity-40" />

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-background/95 backdrop-blur-2xl border border-border/20 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-center mb-10">
            <Logo />
          </div>

          <div className="text-center space-y-3 mb-10">
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === 'signin' ? 'Welcome back' : 'Join the community'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'signin'
                ? 'Sign in to continue to your account'
                : 'Create your account to get started'}
            </p>
          </div>

          {magicLinkState?.success ? (
            <div className="p-6 text-center bg-primary/10 border border-primary/20 rounded-xl">
              <h3 className="text-sm font-medium text-primary">
                Check your email
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                We&apos;ve sent you a magic link to sign in to your account.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <form action={magicLinkAction} className="space-y-6">
                <Input
                  defaultValue={initialEmail}
                  autoComplete="email"
                  autoFocus
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="h-12 bg-background border-border/50 focus:border-primary focus:ring-primary/20 transition-all rounded-lg"
                />

                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 shadow-sm"
                >
                  {pending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Continue with Email'
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-6 text-sm text-muted-foreground bg-background">
                    or
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Button
                  disabled
                  variant="outline"
                  type="button"
                  className="w-full border-border/50 hover:bg-muted/50 px-6 py-3 rounded-lg transition-all font-medium"
                >
                  <Icons.apple className="w-4 h-4 mr-3" />
                  Apple
                </Button>
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  variant="outline"
                  type="button"
                  className="w-full border-border/50 hover:bg-muted/50 px-6 py-3 rounded-lg transition-all disabled:opacity-50 font-medium"
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Icons.google className="w-4 h-4 mr-3" />
                      Google
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center text-xs text-muted-foreground leading-relaxed">
                By continuing, you agree to our{' '}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </div>
            </div>
          )}

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'signin'
                ? 'New to our platform? '
                : 'Already have an account? '}
              <Link
                href={`${mode === 'signin' ? '/register' : '/login'}${
                  redirect ? `?redirect=${redirect}` : ''
                }`}
                className="font-medium text-primary hover:text-primary/90 transition-colors"
              >
                {mode === 'signin' ? 'Create an account' : 'Sign in'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
