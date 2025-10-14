'use client';

import { createClient } from '@/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

const supabase = createClient();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Clear any stale auth data on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const checkInitialSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            // No session found, ensure query cache is cleared
            queryClient.setQueryData(['user'], null);
          }
        } catch {
          // If there's an error getting session, clear the cache
          queryClient.setQueryData(['user'], null);
        }
      };
      
      checkInitialSession();
    }
  }, [queryClient]);

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        // First check if we have a session before trying to get user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          // No session exists, return null without trying to get user
          return null;
        }

        // Only try to get user if we have a valid session
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          // Handle auth errors silently for missing sessions
          if (error.message?.includes('Auth session missing') || 
              error.message?.includes('session_not_found') ||
              error.status === 400) {
            return null;
          }
          console.error('Error fetching user:', error);
          return null;
        }
        
        return data?.user ?? null;
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        // Handle AuthSessionMissingError silently
        if (error?.message?.includes('Auth session missing') ||
            error?.__isAuthError === true ||
            error?.status === 400) {
          return null;
        }
        console.error('Unexpected error fetching user:', error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      // Don't retry auth session missing errors
      if (error?.message?.includes('Auth session missing') ||
          error?.__isAuthError === true ||
          error?.status === 400) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id ? 'User present' : 'No user');
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          queryClient.setQueryData(['user'], session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          // Immediately clear user data
          queryClient.setQueryData(['user'], null);
          // Clear all cached data on sign out
          queryClient.clear();
          // Force a refetch to ensure UI updates
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
          }, 100);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const refreshUser = () => {
    refetch();
  };

  return (
    <AuthContext.Provider value={{ 
      user: user ?? null, 
      loading: isLoading,
      error: error?.message ?? null,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
