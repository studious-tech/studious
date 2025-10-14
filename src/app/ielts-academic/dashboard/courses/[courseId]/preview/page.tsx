import { CourseDetail } from '@/components/common/course-detail';

interface CoursePreviewPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function IELTSCoursePreviewPage({ params }: CoursePreviewPageProps) {
  const { courseId } = await params;
  
  return (
    <CourseDetail courseId={courseId} examPath="ielts-academic" isPreview={true} />
  );
}