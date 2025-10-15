import CoursesSection from '@/components/dashboard/courses-section';

export default function IELTSCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Learning Courses</h1>
        <p className="text-muted-foreground">
          Comprehensive courses designed to help you master IELTS Academic and achieve your target band score
        </p>
      </div>

      <CoursesSection examId="ielts-academic" isCompact={false} />
    </div>
  );
}