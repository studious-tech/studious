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
      section_id, 
      name, 
      display_name, 
      description, 
      input_type, 
      response_type, 
      scoring_method, 
      time_limit_seconds, 
      order_index, 
      is_active 
    } = body;

    if (!section_id || !name || !display_name || !input_type || !response_type || !scoring_method) {
      return NextResponse.json(
        { error: 'section_id, name, display_name, input_type, response_type, and scoring_method are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Generate ID from section_id and name
    const id = `${section_id}-${name}`;

    const { data: questionType, error } = await supabase
      .from('question_types')
      .insert({
        id,
        section_id,
        name,
        display_name,
        description,
        input_type,
        response_type,
        scoring_method,
        time_limit_seconds: time_limit_seconds || null,
        order_index: order_index || 1,
        is_active: is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating question type:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(questionType);
  } catch (error) {
    console.error('Admin question types POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}