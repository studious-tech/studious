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
    const questionTypeId = searchParams.get('question_type_id');
    const examId = searchParams.get('exam_id');
    const sectionId = searchParams.get('section_id');
    const isActive = searchParams.get('is_active');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    let query = supabase
      .from('questions')
      .select(
        `
        *,
        question_types (
          id,
          name,
          display_name,
          section_id,
          sections (
            id,
            name,
            display_name,
            exam_id,
            exams (
              id,
              name,
              display_name
            )
          )
        ),
        question_media (
          *,
          media (*)
        ),
        question_options (*)
      `
      )
      .order('created_at', { ascending: false });

    // Apply filters
    if (questionTypeId) {
      query = query.eq('question_type_id', questionTypeId);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    // Handle exam/section filtering
    if (sectionId) {
      const { data: questionTypes } = await supabase
        .from('question_types')
        .select('id')
        .eq('section_id', sectionId);

      const questionTypeIds = questionTypes?.map((qt) => qt.id) || [];
      if (questionTypeIds.length > 0) {
        query = query.in('question_type_id', questionTypeIds);
      } else {
        return NextResponse.json({ questions: [], total: 0 });
      }
    } else if (examId) {
      const { data: sections } = await supabase
        .from('sections')
        .select('id')
        .eq('exam_id', examId);

      const sectionIds = sections?.map((s) => s.id) || [];
      if (sectionIds.length > 0) {
        const { data: questionTypes } = await supabase
          .from('question_types')
          .select('id')
          .in('section_id', sectionIds);

        const questionTypeIds = questionTypes?.map((qt) => qt.id) || [];
        if (questionTypeIds.length > 0) {
          query = query.in('question_type_id', questionTypeIds);
        } else {
          return NextResponse.json({ questions: [], total: 0 });
        }
      } else {
        return NextResponse.json({ questions: [], total: 0 });
      }
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    const { data: questions, error } = await query.range(
      parseInt(offset),
      parseInt(offset) + parseInt(limit) - 1
    );

    if (error) {
      console.error('Error fetching admin questions:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      questions,
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Admin questions GET error:', error);
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

    const body = await request.json();
    const {
      question_type_id,
      title,
      content,
      instructions,
      difficulty_level,
      time_limit_seconds,
      is_active = true,
      media_ids = [],
      options = [],
    } = body;

    // Validate required fields
    if (!question_type_id || !title || !content) {
      return NextResponse.json(
        { error: 'question_type_id, title, and content are required' },
        { status: 400 }
      );
    }

    // Validate question type exists
    const { data: questionType, error: questionTypeError } = await supabase
      .from('question_types')
      .select('id, input_type, response_type')
      .eq('id', question_type_id)
      .single();

    if (questionTypeError || !questionType) {
      return NextResponse.json(
        { error: 'Invalid question_type_id' },
        { status: 400 }
      );
    }

    // Generate question ID
    const questionId = `${question_type_id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert({
        id: questionId,
        question_type_id,
        title,
        content,
        instructions,
        difficulty_level: difficulty_level || 1,
        expected_duration_seconds: time_limit_seconds,
        is_active,
        created_by: adminCheck.user.id,
      })
      .select()
      .single();

    if (questionError) {
      console.error('Error creating question:', questionError);
      return NextResponse.json(
        { error: questionError.message },
        { status: 400 }
      );
    }

    // Add media associations if provided
    if (media_ids.length > 0) {
      const mediaAssociations = media_ids.map(
        (mediaId: string, index: number) => ({
          question_id: questionId,
          media_id: mediaId,
          media_role: 'primary',
          display_order: index + 1,
        })
      );

      const { error: mediaError } = await supabase
        .from('question_media')
        .insert(mediaAssociations);

      if (mediaError) {
        console.error('Error associating media:', mediaError);
        // Don't fail the question creation, just log the error
      }
    }

    // Add options if provided (for MCQ questions)
    if (options.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const questionOptions = options.map((option: any, index: number) => ({
        question_id: questionId,
        option_text: option.text,
        option_media_id: option.media_id || null,
        is_correct: option.is_correct || false,
        display_order: index + 1,
      }));

      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(questionOptions);

      if (optionsError) {
        console.error('Error creating options:', optionsError);
        // Don't fail the question creation, just log the error
      }
    }

    // Fetch the complete question with relations
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
    console.error('Admin questions POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
