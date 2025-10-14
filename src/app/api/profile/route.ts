import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { getOrCreateUserProfile } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get profile and create if doesn't exist
    const profile = await getOrCreateUserProfile(user.id);

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate target_exam values
    const validExams = ['pte-academic', 'ielts-academic', 'ielts-general'];
    if (body.target_exam && !validExams.includes(body.target_exam)) {
      return NextResponse.json(
        {
          error:
            'Invalid target_exam. Must be one of: pte-academic, ielts-academic, ielts-general',
        },
        { status: 400 }
      );
    }

    // Validate target_score ranges
    if (body.target_score !== undefined) {
      if (
        body.target_exam === 'pte-academic' &&
        (body.target_score < 10 || body.target_score > 90)
      ) {
        return NextResponse.json(
          {
            error: 'PTE target score must be between 10 and 90',
          },
          { status: 400 }
        );
      }
      if (
        (body.target_exam === 'ielts-academic' ||
          body.target_exam === 'ielts-general') &&
        (body.target_score < 1 || body.target_score > 9)
      ) {
        return NextResponse.json(
          {
            error: 'IELTS target score must be between 1 and 9',
          },
          { status: 400 }
        );
      }
    }

    // Update profile
    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update({
        full_name: body.full_name,
        target_exam: body.target_exam,
        target_score: body.target_score,
        preferences: body.preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
