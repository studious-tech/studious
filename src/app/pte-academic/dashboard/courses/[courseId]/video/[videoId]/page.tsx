import { VideoPlayer } from '@/components/common/video-player';

interface VideoPlayerPageProps {
  params: Promise<{ courseId: string; videoId: string }>;
}

export default async function PTEVideoPlayerPage({ params }: VideoPlayerPageProps) {
  const { courseId, videoId } = await params;
  
  return (
    <div className="space-y-6">
      <VideoPlayer courseId={courseId} videoId={videoId} examPath="pte-academic" />
    </div>
  );
}