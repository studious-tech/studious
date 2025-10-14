'use client';

import { useEffect, useState } from 'react';
import { useUserCourseStore } from '@/stores/user-course';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Play,
  PlayCircle,
  Clock,
  BookOpen,
  FileText,
  Download,
  CheckCircle2,
  Lock,
  Users,
  Star,
  Trophy,
  Video,
  FileDown
} from 'lucide-react';
import { getThumbnailUrl, getMediaDownloadUrl, formatFileSize } from '@/lib/media-utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CourseDetailProps {
  courseId: string;
  examPath: string;
  isPreview?: boolean;
}

export function CourseDetail({ courseId, examPath, isPreview = false }: CourseDetailProps) {
  const router = useRouter();
  const { 
    currentCourse, 
    loading, 
    error, 
    getCourseById,
    isEnrolledInCourse,
    enrollInCourse
  } = useUserCourseStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  useEffect(() => {
    getCourseById(courseId);
  }, [courseId, getCourseById]);

  useEffect(() => {
    const checkEnrollment = async () => {
      const enrolled = await isEnrolledInCourse(courseId);
      setIsEnrolled(enrolled);
    };
    checkEnrollment();
  }, [courseId, isEnrolledInCourse]);

  const handleEnrollment = async () => {
    setEnrollmentLoading(true);
    const success = await enrollInCourse(courseId);
    if (success) {
      setIsEnrolled(true);
    }
    setEnrollmentLoading(false);
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 2: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 3: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 4: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 5: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Elementary';
      case 3: return 'Intermediate';
      case 4: return 'Upper Intermediate';
      case 5: return 'Advanced';
      default: return 'Unknown';
    }
  };

  // Get appropriate color based on exam
  const getExamColor = () => {
    if (examPath.includes('ielts')) {
      return {
        text: 'text-blue-600',
        border: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
    } else {
      return {
        text: 'text-orange-600',
        border: 'border-orange-200',
        button: 'bg-orange-600 hover:bg-orange-700'
      };
    }
  };

  const colors = getExamColor();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
        </div>
      </div>
    );
  }

  if (error || !currentCourse) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className={`mb-4 ${error ? 'text-red-600' : 'text-gray-600'}`}>
              {error || 'Course not found'}
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const course = currentCourse;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="ml-2">Back to Courses</span>
        </Button>
      </div>

      {/* Course Header */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {/* Course Thumbnail */}
          {getThumbnailUrl(course.thumbnail_media_id) && (
            <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={getThumbnailUrl(course.thumbnail_media_id)!}
                alt={course.display_name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
              />
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold">{course.display_name}</h1>
              {course.is_premium && (
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  <Trophy className="w-4 h-4" />
                  Premium
                </Badge>
              )}
              <Badge className={`${getDifficultyColor(course.difficulty_level || 3)} px-3 py-1`}>
                {getDifficultyText(course.difficulty_level || 3)}
              </Badge>
            </div>
            
            <p className="text-lg text-muted-foreground">
              {course.description || 'Comprehensive preparation course designed to help you achieve your target score.'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center p-3 bg-muted rounded-lg">
              <Clock className="w-5 h-5 text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{Math.round((course.duration_minutes || 0) / 60)} hours</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-muted rounded-lg">
              <Video className="w-5 h-5 text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Videos</p>
                <p className="font-semibold">
                  {course.modules?.reduce((acc, module) => acc + (module.videos?.length || 0), 0) || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-muted rounded-lg">
              <FileText className="w-5 h-5 text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Materials</p>
                <p className="font-semibold">{course.materials?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-muted rounded-lg">
              <Users className="w-5 h-5 text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="font-semibold">0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-80 space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              {!isPreview && (
                <>
                  {isEnrolled ? (
                    <Button size="lg" className={`w-full ${colors.button} text-white`} asChild>
                      <Link href={`/${examPath}/dashboard/courses/${courseId}/video/${course.modules?.[0]?.videos?.[0]?.id || ''}`}>
                        <Play className="w-4 h-4 mr-2" />
                        Continue Course
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      className={`w-full ${colors.button} text-white`}
                      onClick={handleEnrollment}
                      disabled={enrollmentLoading}
                    >
                      {course.is_premium && <Lock className="w-4 h-4 mr-2" />}
                      {enrollmentLoading ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  )}
                </>
              )}
              
              {isPreview && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    This is a preview. Enroll to access full content.
                  </p>
                  <Button size="lg" className={`w-full ${colors.button} text-white`} asChild>
                    <Link href={`/${examPath}/dashboard/courses/${courseId}`}>
                      <Lock className="w-4 h-4 mr-2" />
                      Enroll to Access
                    </Link>
                  </Button>
                </div>
              )}

              <div className="text-center pt-2">
                <div className="flex items-center justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">4.8 (234 reviews)</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Course Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">What you'll learn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p>Master all four skills: Reading, Writing, Listening, and Speaking</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p>Learn proven strategies and techniques for each question type</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p>Practice with authentic exam materials and mock tests</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p>Build vocabulary and improve grammar for higher band scores</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Course Requirements</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>Intermediate level of English proficiency</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>Access to computer or mobile device for online learning</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>Dedicated study time of at least 2-3 hours per week</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
              <CardDescription>
                {course.modules?.length || 0} modules • {course.modules?.reduce((acc, module) => acc + (module.videos?.length || 0), 0) || 0} videos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.modules?.length ? course.modules.map((module) => (
                <div key={module.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{module.display_name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {module.videos?.length || 0} videos • {Math.round((module.duration_minutes || 0) / 60)}h
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {module.is_active ? (
                          <Badge variant="secondary">Active</Badge>
                        ) : (
                          <Badge variant="outline">Coming Soon</Badge>
                        )}
                        <PlayCircle className={`w-5 h-5 text-muted-foreground transition-transform ${expandedModules.has(module.id) ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  </button>
                  
                  {expandedModules.has(module.id) && (
                    <div className="px-5 pb-5 border-t bg-muted/30">
                      <div className="space-y-3 pt-5">
                        {module.videos?.map((video) => (
                          <div key={video.id} className="flex items-center justify-between p-4 bg-background rounded-lg border">
                            <div className="flex items-center gap-4">
                              <Play className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-medium">{video.display_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {Math.round((video.duration_seconds || 0) / 60)} min
                                </p>
                              </div>
                            </div>
                            
                            <Link 
                              href={`/${examPath}/dashboard/courses/${courseId}/video/${video.id}`}
                              className={`text-primary hover:underline text-sm font-medium`}
                            >
                              Watch
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-xl font-semibold mb-2">No modules available</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Course content is being prepared. Check back later for updates.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Materials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.materials?.length ? course.materials.map((material) => {
                const downloadUrl = getMediaDownloadUrl(material.file_media_id);
                
                return (
                  <div key={material.id} className="flex items-center justify-between p-5 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <FileDown className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{material.display_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {material.file_type?.toUpperCase()} • {formatFileSize(material.file_size || 0)}
                        </p>
                        {material.description && (
                          <p className="text-sm text-muted-foreground mt-1">{material.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {isEnrolled && downloadUrl ? (
                      <Button variant="outline" asChild>
                        <Link href={downloadUrl} target="_blank">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" disabled={!isEnrolled}>
                        <Lock className="w-4 h-4 mr-2" />
                        {!isEnrolled ? 'Enroll to Download' : 'Download'}
                      </Button>
                    )}
                  </div>
                );
              }) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-xl font-semibold mb-2">No materials available</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Study materials will be added soon. Check back later for updates.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}