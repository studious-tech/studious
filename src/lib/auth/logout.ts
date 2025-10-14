'use client';

import { createClient } from '@/supabase/client';

export async function handleLogout() {
  try {
    const supabase = createClient();
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
    }
    
    // Clear any localStorage/sessionStorage auth data
    if (typeof window !== 'undefined') {
      // Clear any auth-related items from storage
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('profile-storage');
      sessionStorage.clear();
    }
    
    // Redirect to home page
    window.location.href = '/';
    
  } catch (error) {
    console.error('Unexpected error during logout:', error);
    
    // Force clear storage and redirect even if logout fails
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('profile-storage');
      sessionStorage.clear();
      window.location.href = '/';
    }
  }
}

// Hook for logout with loading state
export function useLogout() {
  const logout = async () => {
    await handleLogout();
  };

  return { logout };
}