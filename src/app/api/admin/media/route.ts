import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// Check if user is admin
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkAdminAccess(supabase: any) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 };
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { error: 'Admin access required', status: 403 };
  }

  return { user };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminCheck = await checkAdminAccess(supabase);

    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('file_type');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    let query = supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (fileType) {
      query = query.eq('file_type', fileType);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    const { data: media, error } = await query.range(
      parseInt(offset),
      parseInt(offset) + parseInt(limit) - 1
    );

    if (error) {
      console.error('Error fetching admin media:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Generate public URLs for media files
    const mediaWithUrls = await Promise.all(
      media.map(async (item) => {
        const { data: urlData } = supabase.storage
          .from(item.storage_bucket)
          .getPublicUrl(item.storage_path);

        return {
          ...item,
          public_url: urlData.publicUrl,
        };
      })
    );

    return NextResponse.json({
      media: mediaWithUrls,
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Admin media GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminCheck = await checkAdminAccess(supabase);

    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Debug logging
    console.log('Admin media upload attempt:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileSizeInMB: (file.size / (1024 * 1024)).toFixed(2)
    });

    // Validate file type and size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      // Audio formats (comprehensive list)
      'audio/mpeg',        // MP3
      'audio/mp3',         // MP3 (alternate)
      'audio/wav',         // WAV
      'audio/wave',        // WAV (alternate)
      'audio/x-wav',       // WAV (alternate)
      'audio/webm',        // WebM Audio
      'audio/ogg',         // OGG
      'audio/mp4',         // MP4 Audio
      'audio/aac',         // AAC
      'audio/flac',        // FLAC
      'audio/x-flac',      // FLAC (alternate)
      'audio/m4a',         // M4A
      'video/mp4',
      'video/webm',
      'application/pdf',
    ];

    if (!allowedTypes.includes(file.type)) {
      console.log('File type not allowed:', {
        received: file.type,
        allowed: allowedTypes,
        isAudio: file.type.startsWith('audio/')
      });
      return NextResponse.json(
        { error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Determine file type category
    let fileType = 'other';
    if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else if (file.type.startsWith('audio/')) {
      fileType = 'audio';
    } else if (file.type.startsWith('video/')) {
      fileType = 'video';
    } else if (file.type === 'application/pdf') {
      fileType = 'document';
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileType}/${timestamp}-${randomString}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('exam-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', {
        error: uploadError,
        fileName: fileName,
        fileType: fileType,
        mimeType: file.type,
        bucket: 'exam-media'
      });
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 400 });
    }

    // Generate media ID
    const mediaId = `m_${fileType}_${timestamp}`;

    // Create media record
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .insert({
        id: mediaId,
        original_filename: file.name,
        file_type: fileType,
        mime_type: file.type,
        file_size: file.size,
        storage_path: uploadData.path,
        storage_bucket: 'exam-media',
        alt_text: description || null, // Use alt_text instead of description
        created_by: adminCheck.user.id,
      })
      .select()
      .single();

    if (mediaError) {
      console.error('Media record error:', mediaError);
      // Try to clean up uploaded file
      await supabase.storage.from('exam-media').remove([uploadData.path]);

      return NextResponse.json({ error: mediaError.message }, { status: 400 });
    }

    // Generate public URL
    const { data: urlData } = supabase.storage
      .from('exam-media')
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      ...media,
      public_url: urlData.publicUrl,
    });
  } catch (error) {
    console.error('Admin media POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminCheck = await checkAdminAccess(supabase);

    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('media_id');

    if (!mediaId) {
      return NextResponse.json(
        { error: 'media_id is required' },
        { status: 400 }
      );
    }

    // Get media record
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (fetchError || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Check if media is being used by any questions
    const { data: questionMedia, error: usageError } = await supabase
      .from('question_media')
      .select('question_id')
      .eq('media_id', mediaId)
      .limit(1);

    if (usageError) {
      console.error('Error checking media usage:', usageError);
      return NextResponse.json(
        { error: 'Error checking media usage' },
        { status: 400 }
      );
    }

    if (questionMedia && questionMedia.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete media that is being used by questions' },
        { status: 400 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(media.storage_bucket)
      .remove([media.storage_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete media record
    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .eq('id', mediaId);

    if (deleteError) {
      console.error('Media deletion error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Admin media DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
