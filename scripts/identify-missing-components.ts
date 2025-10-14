import { createClient } from '@/supabase/server';

// Define the question type interface
interface QuestionType {
  id: string;
  name: string;
  display_name: string;
  ui_component: string | null;
  [key: string]: any; // Allow other properties
}

// Script to identify missing question type components
export async function identifyMissingComponents() {
  const supabase = await createClient();
  
  // Fetch all question types
  const { data: questionTypes, error } = await supabase
    .from('question_types')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching question types:', error);
    return;
  }
  
  // Group by ui_component
  const groupedTypes = questionTypes?.reduce((acc, qt) => {
    const key = qt.ui_component || 'NULL';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(qt);
    return acc;
  }, {} as Record<string, QuestionType[]>);
  
  console.log('Question Types by UI Component:');
  Object.entries(groupedTypes || {}).forEach(([component, types]) => {
    console.log(`\n${component} (${(types as QuestionType[]).length} types):`);
    (types as QuestionType[]).forEach(type => {
      console.log(`  - ${type.name} (${type.display_name})`);
    });
  });
  
  // Identify missing components
  const missingComponents = Object.entries(groupedTypes || {})
    .filter(([component]) => component === 'NULL')
    .flatMap(([, types]) => types as QuestionType[]);
    
  console.log('\nMissing Components:');
  missingComponents.forEach(type => {
    console.log(`  - ${type.name} (${type.display_name})`);
  });
}

// Run the script
identifyMissingComponents().catch(console.error);