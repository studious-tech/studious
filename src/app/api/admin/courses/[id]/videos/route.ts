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

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const body = await request.json();
    const { 
      module_id, 
      name, 
      display_name, 
      description, 
      video_type,
      video_url,
      video_media_id,
      thumbnail_media_id,
      duration_seconds,
      sort_order,
      is_active
    } = body;

    if (!module_id || !name || !display_name) {
      return NextResponse.json(
        { error: 'module_id, name and display_name are required' },
        { status: 400 }
      );
    }

    // Validate video type
    if (video_type === 'youtube' && !video_url) {
      return NextResponse.json(
        { error: 'video_url is required for YouTube videos' },
        { status: 400 }
      );
    }

    if (video_type === 'upload' && !video_media_id) {
      return NextResponse.json(
        { error: 'video_media_id is required for uploaded videos' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Generate ID from module_id and name
    const id = `${module_id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    const { data: video, error } = await supabase
      .from('course_videos')
      .insert({
        id,
        module_id,
        name,
        display_name,
        description,
        video_type: video_type || 'upload',
        video_url: video_url || null,
        video_media_id: video_media_id || null,
        thumbnail_media_id: thumbnail_media_id || null,
        duration_seconds: duration_seconds || null,
        sort_order: sort_order || 0,
        is_active: is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating video:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error('Admin videos POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}