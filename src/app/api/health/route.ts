import { createClient } from '@/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = await createClient();
    
    // Test connection by fetching a simple record
    const { data, error } = await supabase
      .from('exams')
      .select('id, name, display_name')
      .limit(1);
    
    if (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          code: error.code
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
        data: data || [],
        count: data?.length || 0
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