import CoursesSection from '@/components/dashboard/courses-section';

export default function PTECoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Learning Courses</h1>
        <p className="text-muted-foreground">
          Comprehensive courses designed to help you master PTE Academic and achieve your target score
        </p>
      </div>

      <CoursesSection examId="pte-academic" isCompact={false} />
    </div>
  );
}