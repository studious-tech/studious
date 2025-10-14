'use client';

import { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { createClient } from '@/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function ProfileChecker() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      // Check if user profile exists
      const checkProfile = async () => {
        try {
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            console.log('Profile not found, creating one for user:', user.email);
            
            const profileData = {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.user_metadata?.display_name ||
                        null,
              role: 'student',
              avatar_url: user.user_metadata?.avatar_url || null,
            };

            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert(profileData);

            if (insertError) {
              console.error('Error creating profile:', insertError);
              toast.error('Failed to create user profile. Please contact support.');
            } else {
              console.log('Profile created successfully');
              toast.success('Welcome! Your profile has been set up.');
            }
          } else if (profile) {
            console.log('Profile already exists for user:', user.email);
          } else if (error) {
            console.error('Error checking profile:', error);
            toast.error('Error checking user profile.');
          }
        } catch (error) {
          console.error('Error in profile check:', error);
          toast.error('Unexpected error while checking profile.');
        }
      };

      checkProfile();
    }
  }, [user, supabase, router]);

  return null;
}