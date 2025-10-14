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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const body = await request.json();
    const supabase = await createClient();

    // Validate video type if provided
    if (body.video_type === 'youtube' && body.video_url === undefined) {
      return NextResponse.json(
        { error: 'video_url is required for YouTube videos' },
        { status: 400 }
      );
    }

    if (body.video_type === 'upload' && body.video_media_id === undefined) {
      return NextResponse.json(
        { error: 'video_media_id is required for uploaded videos' },
        { status: 400 }
      );
    }

    const { data: video, error } = await supabase
      .from('course_videos')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', videoId)
      .select()
      .single();

    if (error) {
      console.error('Error updating video:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error('Admin video PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('course_videos')
      .delete()
      .eq('id', videoId);

    if (error) {
      console.error('Error deleting video:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin video DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}