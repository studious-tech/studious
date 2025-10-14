'use server';
import { z } from 'zod';
import { validatedAction } from '@/lib/auth/middleware';
import { createClient } from '@/supabase/server';
import config from '@/config';

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email(),
  redirect: z.string().optional(),
});

export const signInWithMagicLink = validatedAction(
  emailSchema,
  async (data) => {
    try {
      const supabase = await createClient();
      const { email } = data;
      const redirectTo = `${config.domainName}/api/auth/callback`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${redirectTo}?redirect=${encodeURIComponent(
            data.redirect || '/'
          )}`,
        },
      });

      if (error) {
        console.error('Error sending magic link:', error);

        // Handle specific error cases
        if (error.message.includes('rate limit')) {
          return {
            error: 'Too many requests. Please wait before trying again.',
          };
        }
        if (error.message.includes('invalid email')) {
          return { error: 'Please enter a valid email address.' };
        }

        return {
          error:
            error.message || 'Failed to send magic link. Please try again.',
        };
      }

      return {
        success:
          'Magic link sent to your email. Please check your inbox and spam folder.',
      };
    } catch (error) {
      console.error('Unexpected error in signInWithMagicLink:', error);
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  }
);

// Server-side signOut removed - using client-side logout function instead

// Additional helper function for getting current user
export const getCurrentUser = async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Unexpected error getting current user:', error);
    return null;
  }
};
