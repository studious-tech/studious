import { createClient } from '@/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = await createClient();
    
    // Check if we have any exams
    const { data: exams, error: examsError } = await supabase
      .from('exams')
      .select('*');
    
    if (examsError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: examsError.message
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // If no exams exist, create some test data
    if (!exams || exams.length === 0) {
      // Create IELTS exam
      const { error: ieltsError } = await supabase
        .from('exams')
        .insert({
          id: 'ielts-academic',
          name: 'ielts-academic',
          display_name: 'IELTS Academic',
          description: 'International English Language Testing System - Academic Version',
          duration_minutes: 180,
          total_score: 9,
          is_active: true
        });
      
      if (ieltsError) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: ieltsError.message
          }), 
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Create PTE exam
      const { error: pteError } = await supabase
        .from('exams')
        .insert({
          id: 'pte-academic',
          name: 'pte-academic',
          display_name: 'PTE Academic',
          description: 'Pearson Test of English - Academic Version',
          duration_minutes: 180,
          total_score: 90,
          is_active: true
        });
      
      if (pteError) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: pteError.message
          }), 
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Test exams created successfully'
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Database already has exams',
        examCount: exams.length
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}