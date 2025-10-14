import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// GET /api/questions - Fetch questions for practice/testing
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const questionTypeId = searchParams.get('question_type_id');
    const examId = searchParams.get('exam_id');
    const sectionId = searchParams.get('section_id');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
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
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (questionTypeId) {
      query = query.eq('question_type_id', questionTypeId);
    }

    if (difficulty) {
      query = query.eq('difficulty_level', parseInt(difficulty));
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
        return NextResponse.json([]);
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
          return NextResponse.json([]);
        }
      } else {
        return NextResponse.json([]);
      }
    }

    const { data: questions, error } = await query;

    if (error) {
      console.error('Error fetching questions:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(questions || []);
  } catch (error) {
    console.error('Questions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/questions - Create a new question (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      question_type_id,
      title,
      content,
      instructions,
      difficulty_level,
      expected_duration_seconds,
      is_active,
      question_options = [],
      question_media = [],
    } = body;

    // Validate required fields
    if (!question_type_id) {
      return NextResponse.json(
        { error: 'question_type_id is required' },
        { status: 400 }
      );
    }

    // Create the question
    const { data: question, error: insertError } = await supabase
      .from('questions')
      .insert({
        question_type_id,
        title: title || null,
        content: content || null,
        instructions: instructions || null,
        difficulty_level: difficulty_level || 3,
        expected_duration_seconds: expected_duration_seconds || null,
        is_active: is_active !== undefined ? is_active : true,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating question:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }

    // Create question options if provided
    if (question_options.length > 0) {
      const optionsToInsert = question_options.map(
        (option: any, index: number) => ({
          question_id: question.id,
          option_text: option.text,
          is_correct: option.is_correct || false,
          display_order: option.display_order || index + 1,
          option_media_id: option.media_id || null,
        })
      );

      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(optionsToInsert);

      if (optionsError) {
        console.error('Error creating question options:', optionsError);
        // Don't fail the whole operation, just log the error
      }
    }

    // Create question media associations if provided
    if (question_media.length > 0) {
      const mediaToInsert = question_media.map(
        (media: any, index: number) => ({
          question_id: question.id,
          media_id: media.media_id,
          media_role: media.role || 'question_content',
          display_order: media.display_order || index + 1,
        })
      );

      const { error: mediaError } = await supabase
        .from('question_media')
        .insert(mediaToInsert);

      if (mediaError) {
        console.error('Error creating question media:', mediaError);
        // Don't fail the whole operation, just log the error
      }
    }

    // Fetch the complete question with relations
    const { data: completeQuestion, error: fetchError } = await supabase
      .from('questions')
      .select(
        `
        *,
        question_types (*),
        question_media (*, media (*)),
        question_options (*)
      `
      )
      .eq('id', question.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete question:', fetchError);
      // Return the created question even if we can't fetch the complete version
      return NextResponse.json(question);
    }

    return NextResponse.json(completeQuestion);
  } catch (error) {
    console.error('Question creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}