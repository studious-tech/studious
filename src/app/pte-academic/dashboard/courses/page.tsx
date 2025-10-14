import { SharedCoursesList } from '@/components/dashboard/shared-courses-list';

export default function PTECoursesPage() {
  return (
    <SharedCoursesList 
      examId="pte-academic"
      examDisplayName="PTE Academic"
    />
  );
}