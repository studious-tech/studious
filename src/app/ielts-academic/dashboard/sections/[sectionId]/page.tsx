import { SharedSectionViewer } from '@/components/dashboard/shared-section-viewer';
import { createClient } from '@/supabase/server';

export default async function SectionPage({ 
  params 
}: { 
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const supabase = await createClient();

  // Fetch section data with question types and questions
  const { data: sectionData, error } = await supabase
    .from('sections')
    .select(
      `
      *,
      exams (display_name),
      question_types (
        *,
        questions (id)
      )
    `
    )
    .eq('id', sectionId)
    .eq('is_active', true)
    .single();

  if (error || !sectionData) {
    console.error('Dashboard: Error loading section:', error);
    return <div>Error loading section</div>;
  }

  console.log('Dashboard: Section data loaded:', sectionData);

  return (
    <div className="space-y-6">
      <SharedSectionViewer section={sectionData} examId="ielts-academic" />
    </div>
  );
}