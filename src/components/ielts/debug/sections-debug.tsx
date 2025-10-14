'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/supabase/client';

export function SectionsDebug() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      try {
        // First, check if any exams exist
        const { data: exams, error: examError } = await supabase
          .from('exams')
          .select('*');
        
        console.log('All exams:', exams);
        
        // Then check sections
        const { data: allSections, error: sectionsError } = await supabase
          .from('sections')
          .select('*');
        
        console.log('All sections:', allSections);
        
        // Then check IELTS-specific sections
        const { data: ieltsExam } = await supabase
          .from('exams')
          .select('id, name, display_name')
          .eq('id', 'ielts-academic')
          .single();
        
        console.log('IELTS Academic exam:', ieltsExam);
        
        const { data: ieltsSections, error } = await supabase
          .from('sections')
          .select(`
            id,
            name,
            display_name,
            description,
            order_index,
            is_active
          `)
          .eq('exam_id', 'ielts-academic');
        
        console.log('IELTS Academic sections:', ieltsSections);
        
        if (error) {
          setError(error.message);
        } else {
          setSections(ieltsSections || []);
        }
      } catch (err) {
        console.error('Debug error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4 bg-yellow-100">Loading debug info...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="font-bold mb-2">Database Debug Info</h3>
      {error && (
        <div className="text-red-600 mb-2">Error: {error}</div>
      )}
      <div>
        <strong>Found {sections.length} sections for ielts-academic:</strong>
        <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
          {JSON.stringify(sections, null, 2)}
        </pre>
      </div>
    </div>
  );
}