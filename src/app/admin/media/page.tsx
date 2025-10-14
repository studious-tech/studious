'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Upload } from 'lucide-react';
import { AdminDataTable } from '@/components/admin/data-table/admin-data-table';
import { adminMediaColumns, AdminMedia } from '@/components/admin/data-table/admin-media-columns';
import { useAdminStore } from '@/stores/admin';

export default function MediaPage() {
  const { media, mediaLoading, fetchMedia, uploadMedia } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // In a real implementation, we would filter the data based on these filters
  // For now, we'll pass the full data set to the table

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadMedia(file);
        // Refresh media list
        fetchMedia();
      } catch (error) {
        console.error('Failed to upload media:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Management</h1>
          <p className="text-muted-foreground">
            Manage uploaded media files
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild>
            <label>
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                multiple
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search and filter media files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{media.length}</p>
              <p className="text-sm text-gray-500">Total Files</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {media.filter(m => m.file_type?.startsWith('image')).length}
              </p>
              <p className="text-sm text-gray-500">Images</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {media.filter(m => m.file_type?.startsWith('video')).length}
              </p>
              <p className="text-sm text-gray-500">Videos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {media.filter(m => m.file_type?.startsWith('audio')).length}
              </p>
              <p className="text-sm text-gray-500">Audio</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Table */}
      <AdminDataTable
        columns={adminMediaColumns}
        data={media as AdminMedia[]}
        title="All Media"
        description="Browse and manage all uploaded media files"
        filterPlaceholder="Search media..."
        filterKey="original_filename"
      />
    </div>
  );
}