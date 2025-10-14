'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  HomeIcon, 
  BookOpen, 
  FileText, 
  Settings, 
  Crown, 
  Bell, 
  HelpCircle, 
  Phone
} from 'lucide-react';

const sidebarItems = [
  { title: "Home", icon: HomeIcon, path: "/pte/dashboard" },
  { title: "My Courses", icon: BookOpen, path: "/pte/courses" },
  { title: "Question Types", icon: FileText, path: "/pte/question-types" },
  { title: "Subscription", icon: Crown, path: "/pte/subscription" },
  { title: "Settings", icon: Settings, path: "/pte/settings" },
  { title: "Notification Centre", icon: Bell, path: "/pte/notifications" },
  { title: "Help (Q&A)", icon: HelpCircle, path: "/pte/help" },
  { title: "Contact Us", icon: Phone, path: "/pte/contact" },
];

export function PTESidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="bg-blue-600 text-white p-2 rounded-lg">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg">PTE Master</h2>
          <p className="text-xs text-muted-foreground">Dashboard</p>
        </div>
      </div>
      
      <nav className="space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}