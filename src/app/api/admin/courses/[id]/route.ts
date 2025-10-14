import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// Check if user is admin
async function checkAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 };
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { error: 'Admin access required', status: 403 };
  }

  return { user, supabase };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const supabase = await createClient();

    const { data: course, error } = await supabase
      .from('courses')
      .select(
        `
        *,
        modules:course_modules (
          *,
          videos:course_videos (*)
        ),
        materials:course_materials (*)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching course:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Admin course GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const body = await request.json();
    const supabase = await createClient();

    const { data: course, error } = await supabase
      .from('courses')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating course:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Admin course PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const supabase = await createClient();

    // First delete all related content
    // Get modules and their videos for this course
    const { data: modules } = await supabase
      .from('course_modules')
      .select(
        `
        id,
        videos:course_videos (
          id,
          video_media_id,
          thumbnail_media_id
        )
      `
      )
      .eq('course_id', id);

    // Get course materials
    const { data: materials } = await supabase
      .from('course_materials')
      .select('file_media_id')
      .eq('course_id', id);

    // Get course thumbnail
    const { data: course } = await supabase
      .from('courses')
      .select('thumbnail_media_id')
      .eq('id', id)
      .single();

    // Collect all media IDs to delete
    const mediaIds: string[] = [];

    // Add course thumbnail
    if (course?.thumbnail_media_id) {
      mediaIds.push(course.thumbnail_media_id);
    }

    // Add video media
    if (modules && modules.length > 0) {
      for (const courseModule of modules) {
        if (courseModule.videos && courseModule.videos.length > 0) {
          for (const video of courseModule.videos) {
            if (video.video_media_id) {
              mediaIds.push(video.video_media_id);
            }
            if (video.thumbnail_media_id) {
              mediaIds.push(video.thumbnail_media_id);
            }
          }
        }
      }

      const moduleIds = modules.map((courseModule) => courseModule.id);

      // Delete videos in these modules
      await supabase.from('course_videos').delete().in('module_id', moduleIds);
    }

    // Add material media
    if (materials && materials.length > 0) {
      for (const material of materials) {
        if (material.file_media_id) {
          mediaIds.push(material.file_media_id);
        }
      }
    }

    // Delete modules
    await supabase.from('course_modules').delete().eq('course_id', id);

    // Delete materials
    await supabase.from('course_materials').delete().eq('course_id', id);

    // Delete course access records
    await supabase.from('user_course_access').delete().eq('course_id', id);

    // Delete all associated media files
    if (mediaIds.length > 0) {
      for (const mediaId of mediaIds) {
        try {
          // Get media details
          const { data: media } = await supabase
            .from('media')
            .select('storage_bucket, storage_path')
            .eq('id', mediaId)
            .single();

          if (media) {
            // Delete from storage
            await supabase.storage
              .from(media.storage_bucket)
              .remove([media.storage_path]);

            // Delete media record
            await supabase.from('media').delete().eq('id', mediaId);
          }
        } catch (error) {
          console.error(`Failed to delete media ${mediaId}:`, error);
          // Continue with other deletions
        }
      }
    }

    // Finally delete the course
    const { error } = await supabase.from('courses').delete().eq('id', id);

    if (error) {
      console.error('Error deleting course:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin course DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
