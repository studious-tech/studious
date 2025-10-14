import { createClient } from '@/supabase/server';

/**
 * Ensures a user profile exists for the given user
 * Creates one with default values if it doesn't exist
 */
export async function ensureUserProfile(user: any) {
  const supabase = await createClient();
  
  try {
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('📝 Creating profile for user:', user.email);
      
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    user.user_metadata?.display_name ||
                    null,
          role: 'student', // Default role
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('❌ Error creating user profile:', insertError);
        throw new Error(`Failed to create user profile: ${insertError.message}`);
      } else {
        console.log('✅ User profile created successfully');
        return true; // Profile was created
      }
    } else if (existingProfile) {
      console.log('👤 User profile already exists');
      
      // Optionally update profile with latest auth metadata
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || (existingProfile as any)?.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('⚠️ Error updating user profile:', updateError);
      }
      
      return false; // Profile already existed
    } else if (checkError) {
      console.error('❌ Error checking user profile:', checkError);
      throw new Error(`Failed to check user profile: ${checkError.message}`);
    }
  } catch (error) {
    console.error('💥 Error in ensureUserProfile:', error);
    throw error;
  }
}

/**
 * Gets user profile and creates one if it doesn't exist
 * Useful for middleware or API routes that need profile data
 */
export async function getOrCreateUserProfile(userId: string) {
  const supabase = await createClient();
  
  try {
    // First try to get the profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, get user from auth and create profile
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Unable to get user information');
      }

      await ensureUserProfile(user);
      
      // Fetch the newly created profile
      const { data: newProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch created profile: ${fetchError.message}`);
      }

      return newProfile;
    } else if (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return profile;
  } catch (error) {
    console.error('Error in getOrCreateUserProfile:', error);
    throw error;
  }
}