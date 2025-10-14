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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params;
    const supabase = await createClient();
    const adminCheck = await checkAdminAccess(supabase);

    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { data: media, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (error || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Generate public URL
    const { data: urlData } = supabase.storage
      .from(media.storage_bucket)
      .getPublicUrl(media.storage_path);

    // Get usage information
    const { data: questionMedia } = await supabase
      .from('question_media')
      .select(
        `
        question_id,
        media_role,
        questions (
          id,
          title,
          question_types (
            name,
            display_name
          )
        )
      `
      )
      .eq('media_id', mediaId);

    return NextResponse.json({
      ...media,
      public_url: urlData.publicUrl,
      usage: questionMedia || [],
    });
  } catch (error) {
    console.error('Admin media GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params;
    const supabase = await createClient();
    const adminCheck = await checkAdminAccess(supabase);

    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const body = await request.json();
    const { description } = body; // Only handle description (map to alt_text)

    // Check if media exists
    const { data: existingMedia, error: fetchError } = await supabase
      .from('media')
      .select('id')
      .eq('id', mediaId)
      .single();

    if (fetchError || !existingMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Update media metadata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (description !== undefined) updateData.alt_text = description;

    const { data: media, error: updateError } = await supabase
      .from('media')
      .update(updateData)
      .eq('id', mediaId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating media:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Generate public URL
    const { data: urlData } = supabase.storage
      .from(media.storage_bucket)
      .getPublicUrl(media.storage_path);

    return NextResponse.json({
      ...media,
      public_url: urlData.publicUrl,
    });
  } catch (error) {
    console.error('Admin media PUT error:', error);
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
    const adminCheck = await checkAdminAccess(supabase);

    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
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
