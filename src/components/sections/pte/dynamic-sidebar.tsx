'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/supabase/client';
import { 
  HomeIcon, 
  BookOpen, 
  FileText, 
  Settings, 
  Crown, 
  Bell, 
  HelpCircle, 
  Phone,
  ChevronRight
} from 'lucide-react';

interface Section {
  id: string;
  name: string;
  display_name: string;
  order_index: number;
}

export function PTEDynamicSidebar() {
  const pathname = usePathname();
  // const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple state for current section instead of using search params
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  // Fetch sections from database
  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('sections')
          .select(`
            id,
            name,
            display_name,
            order_index
          `)
          .eq('exam_id', 'pte-academic')
          .eq('is_active', true)
          .order('order_index');

        if (error) {
          throw new Error(error.message);
        }

        setSections(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sections:', err);
        setError('Failed to load sections');
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const staticItems = [
    { title: "Home", icon: HomeIcon, path: "/pte-academic/dashboard" },
    { title: "My Courses", icon: BookOpen, path: "/pte-academic/courses" },
    { title: "Subscription", icon: Crown, path: "/pte-academic/subscription" },
    { title: "Settings", icon: Settings, path: "/pte-academic/settings" },
    { title: "Notification Centre", icon: Bell, path: "/pte-academic/notifications" },
    { title: "Help (Q&A)", icon: HelpCircle, path: "/pte-academic/help" },
    { title: "Contact Us", icon: Phone, path: "/pte-academic/contact" },
  ];

  const isActive = (path: string) => {
    if (pathname === path) return true;
    
    // Check if it's the section path
    if (path.startsWith('/pte-academic/dashboard?section=')) {
      const sectionId = path.split('=')[1];
      return currentSection === sectionId;
    }
    
    return false;
  };

  return (
    <div className="bg-white border-r border-gray-200 h-full">
      <div className="flex items-center gap-3 mb-6 px-4 py-4 border-b border-gray-200">
        <div className="bg-gray-100 p-2 rounded-lg">
          <BookOpen className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">PTE</h2>
          <p className="text-xs text-gray-500">Dashboard</p>
        </div>
      </div>
      
      <nav className="space-y-1 px-2">
        {/* Static items */}
        {staticItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                active
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </button>
          );
        })}

        {/* Sections */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Sections
          </div>
          
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          ) : error ? (
            <div className="px-3 py-2 text-sm text-red-500">{error}</div>
          ) : (
            sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setCurrentSection(section.id);
                  router.push(`/pte-academic/dashboard?section=${section.id}`);
                }}
                className={`w-full flex items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                  currentSection === section.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4" />
                  <span>{section.display_name}</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            ))
          )}
        </div>
      </nav>
    </div>
  );
}