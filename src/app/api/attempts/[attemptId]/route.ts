import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch attempt with question details
    const { data: attempt, error } = await supabase
      .from('question_attempts')
      .select(
        `
        *,
        questions (
          id,
          title,
          content,
          instructions,
          question_type_id,
          question_types (
            name,
            display_name,
            scoring_method
          )
        ),
        media:response_media_id (
          id,
          file_type,
          storage_path,
          storage_bucket
        )
      `
      )
      .eq('id', attemptId)
      .eq('user_id', user.id) // Ensure user can only access their own attempts
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Attempt not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching attempt:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Generate secure URL for response media if exists
    if (attempt.media && attempt.media.storage_path) {
      const { data: urlData } = await supabase.storage
        .from(attempt.media.storage_bucket)
        .createSignedUrl(attempt.media.storage_path, 3600); // 1 hour expiry

      attempt.media.signed_url = urlData?.signedUrl;
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.error('Attempt detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
