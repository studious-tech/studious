import { CourseDetail } from '@/components/common/course-detail';

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function PTECourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params;
  
  return (
    <CourseDetail courseId={courseId} examPath="pte-academic" />
  );
}