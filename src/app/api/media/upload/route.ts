import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const attemptId = formData.get('attempt_id') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (audio files only)
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json(
        {
          error: 'Only audio files are allowed',
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'File size must be less than 10MB',
        },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'webm';
    const fileName = `${user.id}/${timestamp}-${
      attemptId || 'response'
    }.${fileExtension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-responses')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    // Create media record
    const mediaId = `m_audio_${timestamp}`;
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .insert({
        id: mediaId,
        original_filename: file.name,
        file_type: 'audio',
        mime_type: file.type,
        file_size: file.size,
        storage_path: uploadData.path,
        storage_bucket: 'user-responses',
        duration_seconds: null, // Could be calculated later
        created_by: user.id,
      })
      .select()
      .single();

    if (mediaError) {
      console.error('Media record error:', mediaError);
      // Clean up uploaded file if media record creation fails
      await supabase.storage.from('user-responses').remove([uploadData.path]);
      return NextResponse.json({ error: mediaError.message }, { status: 400 });
    }

    // If attemptId is provided, update the attempt with the media_id
    if (attemptId) {
      const { error: updateError } = await supabase
        .from('question_attempts')
        .update({ response_media_id: mediaId })
        .eq('id', attemptId)
        .eq('user_id', user.id); // Ensure user can only update their own attempts

      if (updateError) {
        console.error('Attempt update error:', updateError);
        // Don't fail the upload, just log the error
      }
    }

    return NextResponse.json({
      media_id: mediaId,
      file_name: fileName,
      file_size: file.size,
      file_type: file.type,
      storage_path: uploadData.path,
    });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
