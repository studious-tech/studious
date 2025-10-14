'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCourseStore } from '@/stores/course';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Plus, 
  Edit,
  Trash2,
  MoreVertical,
  ArrowLeft,
  Youtube,
  FileVideo
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VideoDialogForm } from '@/components/admin/content/video-dialog-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ModuleVideosPage() {
  const params = useParams();
  const router = useRouter();
  const { id: courseId, moduleId } = params as { id: string; moduleId: string };
  
  const { 
    selectedCourse, 
    fetchCourse, 
    createVideo,
    updateVideo,
    deleteVideo
  } = useCourseStore();
  
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [courseId, fetchCourse]);

  useEffect(() => {
    if (selectedCourse && moduleId) {
      const module = selectedCourse.modules?.find((m: any) => m.id === moduleId);
      setSelectedModule(module);
    }
  }, [selectedCourse, moduleId]);

  const handleCreateVideo = async (videoData: any) => {
    setLoading(true);
    try {
      await createVideo({ ...videoData, module_id: moduleId });
      toast.success('Video created successfully');
      setShowVideoDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create video');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVideo = async (videoData: any) => {
    if (!editingVideo) return;
    setLoading(true);
    try {
      await updateVideo(editingVideo.id, videoData);
      toast.success('Video updated successfully');
      setEditingVideo(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId: string, videoName: string) => {
    if (confirm(`Are you sure you want to delete "${videoName}"?`)) {
      try {
        await deleteVideo(videoId);
        toast.success('Video deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete video');
      }
    }
  };

  if (!selectedCourse || !selectedModule) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading module details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/admin/content/courses/${courseId}`)}
            className="mb-2 pl-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{selectedModule.display_name}</h1>
          <p className="text-gray-600">{selectedCourse.display_name} &gt; {selectedModule.name}</p>
        </div>

        <Button onClick={() => setShowVideoDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Video
        </Button>
      </div>

      {/* Module Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Module Details</CardTitle>
              <CardDescription>
                Manage videos for this module
              </CardDescription>
            </div>
            <Badge variant="outline">
              {selectedModule.videos?.length || 0} Videos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {selectedModule.description || 'No description provided'}
          </p>
        </CardContent>
      </Card>

      {/* Videos Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Videos</CardTitle>
              <CardDescription>
                All videos in this module
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedModule.videos && selectedModule.videos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedModule.videos.map((video: any) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div className="font-medium">{video.display_name}</div>
                      <div className="text-sm text-gray-500">{video.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {video.video_type === 'youtube' ? (
                          <Youtube className="h-4 w-4 text-red-500" />
                        ) : (
                          <FileVideo className="h-4 w-4 text-blue-500" />
                        )}
                        <Badge variant="outline">
                          {video.video_type === 'youtube' ? 'YouTube' : 'Upload'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {video.duration_seconds ? `${Math.floor(video.duration_seconds / 60)}m ${video.duration_seconds % 60}s` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingVideo(video)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Video
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteVideo(video.id, video.display_name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Video
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No videos found
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by adding your first video to this module
              </p>
              <Button onClick={() => setShowVideoDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Video Dialog */}
      <Dialog open={!!showVideoDialog || !!editingVideo} onOpenChange={(open) => {
        if (!open) {
          setShowVideoDialog(false);
          setEditingVideo(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingVideo ? 'Edit Video' : 'Add Video'}</DialogTitle>
            <DialogDescription>
              {editingVideo ? 'Update the video details' : 'Add a new video to this module'}
            </DialogDescription>
          </DialogHeader>
          <VideoDialogForm
            initialData={editingVideo ? {
              name: editingVideo.name,
              display_name: editingVideo.display_name,
              description: editingVideo.description,
              video_type: editingVideo.video_type,
              video_url: editingVideo.video_url,
              video_media_id: editingVideo.video_media_id,
              thumbnail_media_id: editingVideo.thumbnail_media_id,
              duration_seconds: editingVideo.duration_seconds?.toString() || '',
              is_active: editingVideo.is_active,
              sort_order: editingVideo.sort_order.toString(),
            } : undefined}
            onSubmit={editingVideo ? handleUpdateVideo : handleCreateVideo}
            onCancel={() => {
              setShowVideoDialog(false);
              setEditingVideo(null);
            }}
            submitLabel={editingVideo ? "Update Video" : "Add Video"}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}