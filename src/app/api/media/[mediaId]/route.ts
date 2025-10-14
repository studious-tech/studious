import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

// Helper function to check if media is a course thumbnail
async function checkIfCourseThumnail(
  supabase: SupabaseClient,
  mediaId: string
) {
  const { data } = await supabase
    .from('courses')
    .select('id')
    .eq('thumbnail_media_id', mediaId)
    .limit(1);

  return data && data.length > 0;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Get media record first to check if it's public
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (mediaError || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Allow access to exam-media (public) without authentication
    const isPublicMedia = media.storage_bucket === 'exam-media';

    // Check if this is a course thumbnail (should be accessible in preview mode)
    const isCourseThumbail = await checkIfCourseThumnail(supabase, mediaId);

    if (!isPublicMedia && !isCourseThumbail && (authError || !user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check access permissions (only if user is authenticated)
    const isOwner = user ? media.created_by === user.id : false;

    // Check if user is admin (only if authenticated)
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      isAdmin = profile?.role === 'admin';
    }

    // If not owner, admin, public media, or course thumbnail, check course access
    if (!isOwner && !isPublicMedia && !isAdmin && !isCourseThumbail && user) {
      // Check if this media is associated with a course the user has access to
      const { data: courseAccess } = await supabase
        .from('course_videos')
        .select(
          `
          module:course_modules!inner (
            course:courses!inner (
              id,
              user_access:user_course_access!inner (
                user_id,
                is_active
              )
            )
          )
        `
        )
        .or(`video_media_id.eq.${mediaId},thumbnail_media_id.eq.${mediaId}`)
        .eq('module.course.user_access.user_id', user.id)
        .eq('module.course.user_access.is_active', true)
        .limit(1);

      // Also check course materials
      const { data: materialAccess } = await supabase
        .from('course_materials')
        .select(
          `
          course:courses!inner (
            id,
            user_access:user_course_access!inner (
              user_id,
              is_active
            )
          )
        `
        )
        .eq('file_media_id', mediaId)
        .eq('course.user_access.user_id', user.id)
        .eq('course.user_access.is_active', true)
        .limit(1);

      // Also check course thumbnails
      const { data: courseThumbnailAccess } = await supabase
        .from('courses')
        .select(
          `
          id,
          user_access:user_course_access!inner (
            user_id,
            is_active
          )
        `
        )
        .eq('thumbnail_media_id', mediaId)
        .eq('user_access.user_id', user.id)
        .eq('user_access.is_active', true)
        .limit(1);

      const hasAccess =
        (courseAccess && courseAccess.length > 0) ||
        (materialAccess && materialAccess.length > 0) ||
        (courseThumbnailAccess && courseThumbnailAccess.length > 0);

      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Allow access for public media and course thumbnails without authentication
    if ((isPublicMedia || isCourseThumbail) && !user) {
      // Skip access checks for public content
    }

    // Generate appropriate URL based on storage bucket and path from database
    let mediaUrl;
    if (isPublicMedia || isCourseThumbail) {
      // Public URL for exam media and course thumbnails
      const { data: urlData } = supabase.storage
        .from(media.storage_bucket)
        .getPublicUrl(media.storage_path);

      mediaUrl = urlData.publicUrl;
    } else {
      // Signed URL for private media (user responses)
      const { data: urlData, error: urlError } = await supabase.storage
        .from(media.storage_bucket)
        .createSignedUrl(media.storage_path, 3600); // 1 hour expiry

      if (urlError) {
        console.error('Error generating signed URL:', urlError);
        return NextResponse.json(
          { error: 'Failed to generate media URL' },
          { status: 500 }
        );
      }
      mediaUrl = urlData?.signedUrl;
    }

    // Validate media URL was generated
    if (!mediaUrl) {
      console.error('Media URL not generated for media:', mediaId);
      return NextResponse.json(
        { error: 'Failed to generate media access URL' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const isDownload = url.searchParams.get('download') === 'true';
    const isInfo = url.searchParams.get('info') === 'true';

    // If requesting info, return JSON metadata
    if (isInfo) {
      return NextResponse.json({
        ...media,
        access_url: mediaUrl,
      });
    }

    // Otherwise, serve the actual file
    try {
      const fileResponse = await fetch(mediaUrl);

      if (!fileResponse.ok) {
        console.error(
          'Failed to fetch file from storage:',
          fileResponse.statusText
        );
        return NextResponse.json(
          { error: 'Failed to fetch file' },
          { status: 500 }
        );
      }

      const fileBuffer = await fileResponse.arrayBuffer();

      // Set appropriate headers
      const headers: Record<string, string> = {
        'Content-Type': media.mime_type || 'application/octet-stream',
        'Content-Length': fileBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        ETag: `"${mediaId}"`,
      };

      // Add download header if requested
      if (isDownload) {
        headers[
          'Content-Disposition'
        ] = `attachment; filename="${media.original_filename}"`;
      }

      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });
    } catch (error) {
      console.error('Error serving file:', error);
      return NextResponse.json(
        { error: 'Failed to serve file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Media GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Check permissions - only owner or admin can delete
    const isOwner = media.created_by === user.id;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if media is being used
    const { data: usage } = await supabase
      .from('question_media')
      .select('question_id')
      .eq('media_id', mediaId)
      .limit(1);

    if (usage && usage.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete media that is being used' },
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
    console.error('Media DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
