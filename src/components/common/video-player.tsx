'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  SkipBack,
  SkipForward,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
  ChevronDown,
  PlayCircle,
  Download,
  BookOpen,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserCourseStore } from '@/stores/user-course';
import Link from 'next/link';

interface VideoPlayerProps {
  courseId: string;
  videoId: string;
  examPath: string;
}

export function VideoPlayer({ courseId, videoId, examPath }: VideoPlayerProps) {
  const router = useRouter();
  const { currentCourse, getCourseById } = useUserCourseStore();
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    getCourseById(courseId);
  }, [courseId, getCourseById]);

  // Get all videos across all modules
  const allVideos =
    currentCourse?.modules?.flatMap(
      (module) =>
        module.videos?.map((video) => ({
          ...video,
          moduleName: module.display_name,
        })) || []
    ) || [];

  const currentVideo = allVideos.find((video) => video.id === videoId);
  const currentIndex = allVideos.findIndex((video) => video.id === videoId);

  const nextVideo =
    currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null;
  const prevVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;

  const extractYouTubeId = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const navigateToVideo = (video: any) => {
    router.push(`/${examPath}/dashboard/courses/${courseId}/video/${video.id}`);
  };

  if (!currentCourse || !currentVideo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Video not found</h3>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Get appropriate color based on exam
  const getExamColor = () => {
    if (examPath.includes('ielts')) {
      return {
        text: 'text-blue-600',
        border: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700',
      };
    } else {
      return {
        text: 'text-orange-600',
        border: 'border-orange-200',
        button: 'bg-orange-600 hover:bg-orange-700',
      };
    }
  };

  const colors = getExamColor();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{currentVideo.display_name}</h1>
            <p className="text-sm text-muted-foreground">
              {currentCourse.display_name} • {currentVideo.moduleName}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto">
          Video {currentIndex + 1} of {allVideos.length}
        </Badge>
      </div>

      <div
        className={`grid gap-6 ${
          showSidebar ? 'lg:grid-cols-4' : 'lg:grid-cols-1'
        }`}
      >
        {/* Video Player */}
        <div
          className={`space-y-4 ${
            showSidebar ? 'lg:col-span-3' : 'lg:col-span-1'
          }`}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video bg-black rounded-t-lg overflow-hidden relative">
                {currentVideo.video_type === 'youtube' &&
                currentVideo.video_url ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(
                      currentVideo.video_url
                    )}?autoplay=1&rel=0`}
                    title={currentVideo.display_name}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : currentVideo.video_media_id ? (
                  <video
                    controls
                    className="w-full h-full"
                    poster={
                      currentVideo.thumbnail_media_id
                        ? `/api/media/${currentVideo.thumbnail_media_id}`
                        : undefined
                    }
                  >
                    <source
                      src={`/api/media/${currentVideo.video_media_id}`}
                      type="video/mp4"
                    />
                    <source
                      src={`/api/media/${currentVideo.video_media_id}`}
                      type="video/webm"
                    />
                    <source
                      src={`/api/media/${currentVideo.video_media_id}`}
                      type="video/ogg"
                    />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center p-6">
                      <PlayCircle className="w-16 h-16 mb-4 mx-auto opacity-70" />
                      <p className="text-lg">Video not available</p>
                      <p className="text-sm opacity-75 mt-2">
                        This video content is not currently available.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">
                      {currentVideo.display_name}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        {Math.round((currentVideo.duration_seconds || 0) / 60)}{' '}
                        min
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {currentVideo.description ||
                      'Learn essential concepts and strategies in this comprehensive video lesson.'}
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <div className="flex gap-3">
                    {prevVideo ? (
                      <Button
                        variant="outline"
                        onClick={() => navigateToVideo(prevVideo)}
                        className="flex-1"
                      >
                        <SkipBack className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                    ) : (
                      <Button variant="outline" className="flex-1" disabled>
                        <SkipBack className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                    )}

                    {nextVideo ? (
                      <Button
                        onClick={() => navigateToVideo(nextVideo)}
                        className={`flex-1 ${colors.button} text-white`}
                      >
                        Next
                        <SkipForward className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          router.push(
                            `/${examPath}/dashboard/courses/${courseId}`
                          )
                        }
                        className={`flex-1 ${colors.button} text-white`}
                      >
                        Course Complete
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/${examPath}/dashboard/courses/${courseId}`)
                    }
                    className="flex-1 sm:flex-none"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Course Overview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="space-y-6">
            {/* Video List */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Course Content</CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto space-y-4">
                {currentCourse.modules?.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <div className="font-medium text-sm px-3 py-2 bg-muted rounded-lg">
                      {module.display_name}
                    </div>
                    <div className="space-y-1">
                      {module.videos?.map((video) => (
                        <button
                          key={video.id}
                          onClick={() => navigateToVideo(video)}
                          className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                            video.id === videoId
                              ? 'bg-primary/10 border border-primary/20'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {video.id === videoId ? (
                              <PlayCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">
                                {video.display_name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {Math.round((video.duration_seconds || 0) / 60)}{' '}
                                min
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Course Materials */}
            {currentCourse.materials && currentCourse.materials.length > 0 && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Course Materials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentCourse.materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {material.display_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {material.file_type?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-shrink-0"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Toggle Sidebar Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10 rounded-full shadow-lg"
        onClick={() => setShowSidebar(!showSidebar)}
      >
        {showSidebar ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
