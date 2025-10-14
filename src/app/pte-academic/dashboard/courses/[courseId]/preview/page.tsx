import { CourseDetail } from '@/components/common/course-detail';

interface CoursePreviewPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function PTECoursePreviewPage({ params }: CoursePreviewPageProps) {
  const { courseId } = await params;
  
  return (
    <CourseDetail courseId={courseId} examPath="pte-academic" isPreview={true} />
  );
}