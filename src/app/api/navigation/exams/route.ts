import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

/**
 * GET /api/navigation/exams
 * Returns exam structure optimized for navigation menu (sections + question types)
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch exams with sections and question types for navigation
    const { data: exams, error } = await supabase
      .from('exams')
      .select(
        `
        id,
        name,
        display_name,
        description,
        sections (
          id,
          name,
          display_name,
          description,
          order_index,
          question_types (
            id,
            name,
            display_name,
            description,
            order_index
          )
        )
      `
      )
      .eq('is_active', true)
      .order('created_at');

    if (error) {
      console.error('Error fetching navigation data:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Truncate long descriptions for nav menu
    const truncate = (text: string | null, max = 45): string => {
      if (!text) return '';
      return text.length > max ? `${text.substring(0, max)}...` : text;
    };

    // Transform data for navigation menu
    const navigationData = exams?.map((exam) => {
      // Sort sections by order_index
      const sortedSections = exam.sections
        ?.sort((a, b) => a.order_index - b.order_index)
        .map((section) => ({
          id: section.id,
          name: section.name,
          displayName: section.display_name,
          description: truncate(section.description),
          questionTypes: section.question_types
            ?.sort((a, b) => a.order_index - b.order_index)
            .map((qt) => ({
              id: qt.id,
              name: qt.name,
              displayName: qt.display_name,
              description: truncate(qt.description),
            })) || [],
        })) || [];

      return {
        id: exam.id,
        name: exam.name,
        displayName: exam.display_name,
        description: truncate(exam.description, 60),
        href: `/${exam.id}`,
        sections: sortedSections,
      };
    }) || [];

    return NextResponse.json(navigationData, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Navigation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
