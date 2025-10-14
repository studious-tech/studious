import { createClient } from '@/supabase/server';

export async function getSession() {
  try {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Unexpected error getting session:', error);
    return null;
  }
}

export async function getUser() {
  try {
    const supabase = await createClient();
    
    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      // No session exists, return null without trying to get user
      return null;
    }
    
    // Only try to get user if we have a valid session
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // Handle auth errors silently for missing sessions
      if (error.message?.includes('Auth session missing') || 
          error.message?.includes('session_not_found') ||
          error.status === 400) {
        return null;
      }
      console.error('Error getting user:', error);
      return null;
    }
    
    return user;
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Handle AuthSessionMissingError silently
    if (error?.message?.includes('Auth session missing') ||
        error?.__isAuthError === true ||
        error?.status === 400) {
      return null;
    }
    console.error('Unexpected error getting user:', error);
    return null;
  }
}

export async function refreshSession() {
  try {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Unexpected error refreshing session:', error);
    return null;
  }
}