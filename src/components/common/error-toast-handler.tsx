// components/common/enhanced-error-handler.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

// Map common Supabase error codes to user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Invalid email or password',
  email_not_confirmed:
    'Please check your email and click the confirmation link',
  signup_disabled: 'New registrations are currently disabled',
  email_address_invalid: 'Please enter a valid email address',
  password_too_short: 'Password must be at least 6 characters long',
  user_already_registered: 'An account with this email already exists',
  access_denied: 'Access denied. Please try again.',
  user_banned: 'Your account has been banned. Please contact support.',
};

export default function ErrorToastHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Function to parse hash parameters
    const parseHashParams = () => {
      if (typeof window === 'undefined') return {};

      const hash = window.location.hash.substring(1); // Remove the #
      const params: Record<string, string> = {};

      if (hash) {
        const pairs = hash.split('&');
        pairs.forEach((pair) => {
          const [key, value] = pair.split('=');
          if (key && value) {
            params[key] = decodeURIComponent(value.replace(/\+/g, ' '));
          }
        });
      }

      return params;
    };

    // Get errors from both query params and hash
    const queryError = searchParams.get('error');
    const queryErrorDescription = searchParams.get('error_description');
    const queryErrorCode = searchParams.get('error_code');

    const hashParams = parseHashParams();
    const hashError = hashParams.error;
    const hashErrorDescription = hashParams.error_description;
    const hashErrorCode = hashParams.error_code;

    // Use hash params if available, otherwise fall back to query params
    const error = hashError || queryError;
    const errorDescription = hashErrorDescription || queryErrorDescription;
    const errorCode = hashErrorCode || queryErrorCode;

    if (error || errorDescription || errorCode) {
      // Prioritize error_code for user message, then error
      const errorKey = errorCode || error || '';
      const userMessage =
        ERROR_MESSAGES[errorKey] || error || 'Something went wrong';

      const timer = setTimeout(() => {
        toast.error(userMessage, {
          description: errorDescription || undefined,
          duration: 6000,
          action: {
            label: 'Dismiss',
            onClick: () => toast.dismiss(),
          },
        });

        // Clean up URL by removing error params from both query and hash
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('error');
        newSearchParams.delete('error_description');
        newSearchParams.delete('error_code');

        const newUrl = newSearchParams.toString()
          ? `${window.location.pathname}?${newSearchParams.toString()}`
          : window.location.pathname;

        // Clear hash as well
        window.history.replaceState(null, '', newUrl);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  return null;
}
