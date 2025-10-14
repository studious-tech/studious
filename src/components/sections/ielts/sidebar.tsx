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
  { title: "Home", icon: HomeIcon, path: "/ielts/dashboard" },
  { title: "My Courses", icon: BookOpen, path: "/ielts/courses" },
  { title: "Question Types", icon: FileText, path: "/ielts/question-types" },
  { title: "Subscription", icon: Crown, path: "/ielts/subscription" },
  { title: "Settings", icon: Settings, path: "/ielts/settings" },
  { title: "Notification Centre", icon: Bell, path: "/ielts/notifications" },
  { title: "Help (Q&A)", icon: HelpCircle, path: "/ielts/help" },
  { title: "Contact Us", icon: Phone, path: "/ielts/contact" },
];

export function IELTSSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="bg-green-600 text-white p-2 rounded-lg">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg">IELTS Master</h2>
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
                  ? 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100'
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