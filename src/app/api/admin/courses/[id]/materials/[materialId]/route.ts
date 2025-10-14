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
  { params }: { params: Promise<{ materialId: string }> }
) {
  try {
    const { materialId } = await params;
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const body = await request.json();
    const supabase = await createClient();

    const { data: material, error } = await supabase
      .from('course_materials')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', materialId)
      .select()
      .single();

    if (error) {
      console.error('Error updating material:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error('Admin material PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ materialId: string }> }
) {
  try {
    const { materialId } = await params;
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('course_materials')
      .delete()
      .eq('id', materialId);

    if (error) {
      console.error('Error deleting material:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin material DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}