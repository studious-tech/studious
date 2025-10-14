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
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const supabase = await createClient();
    const adminCheck = await checkAdminAccess(supabase);

    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { data: question, error } = await supabase
      .from('questions')
      .select(
        `
        *,
        question_types (
          *,
          sections (
            *,
            exams (*)
          )
        ),
        question_media (
          *,
          media (*)
        ),
        question_options (*)
      `
      )
      .eq('id', questionId)
      .single();

    if (error || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Admin question GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const supabase = await createClient();
    const adminCheck = await checkAdminAccess(supabase);

    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const body = await request.json();
    const {
      question_type_id,
      title,
      content,
      instructions,
      difficulty_level,
      time_limit_seconds,
      is_active,
      media_ids,
      options,
    } = body;

    // Check if question exists
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('questions')
      .select('id')
      .eq('id', questionId)
      .single();

    if (fetchError || !existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Update the question
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (question_type_id !== undefined)
      updateData.question_type_id = question_type_id;
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (difficulty_level !== undefined)
      updateData.difficulty_level = difficulty_level;
    if (time_limit_seconds !== undefined)
      updateData.expected_duration_seconds = time_limit_seconds;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { error: updateError } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', questionId);

    if (updateError) {
      console.error('Error updating question:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Update media associations if provided
    if (media_ids !== undefined) {
      // Remove existing media associations
      await supabase
        .from('question_media')
        .delete()
        .eq('question_id', questionId);

      // Add new media associations
      if (media_ids.length > 0) {
        const mediaAssociations = media_ids.map(
          (mediaId: string, index: number) => ({
            question_id: questionId,
            media_id: mediaId,
            media_role: 'primary',
            display_order: index + 1,
          })
        );

        await supabase.from('question_media').insert(mediaAssociations);
      }
    }

    // Update options if provided
    if (options !== undefined) {
      // Remove existing options
      await supabase
        .from('question_options')
        .delete()
        .eq('question_id', questionId);

      // Add new options
      if (options.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const questionOptions = options.map((option: any, index: number) => ({
          question_id: questionId,
          option_text: option.text,
          is_correct: option.is_correct || false,
          display_order: index + 1,
        }));

        await supabase.from('question_options').insert(questionOptions);
      }
    }

    // Fetch the complete updated question
    const { data: completeQuestion } = await supabase
      .from('questions')
      .select(
        `
        *,
        question_types (*),
        question_media (*, media (*)),
        question_options (*)
      `
      )
      .eq('id', questionId)
      .single();

    return NextResponse.json(completeQuestion);
  } catch (error) {
    console.error('Admin question PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const supabase = await createClient();
    const adminCheck = await checkAdminAccess(supabase);

    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    // Check if question exists
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('questions')
      .select('id')
      .eq('id', questionId)
      .single();

    if (fetchError || !existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Soft delete - just set is_active to false
    const { error: deleteError } = await supabase
      .from('questions')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId);

    if (deleteError) {
      console.error('Error deleting question:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Admin question DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
