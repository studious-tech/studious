'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Eye, Trash2, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define the media type based on your database schema
export type AdminMedia = {
  id: string;
  original_filename: string | null;
  file_type: string;
  mime_type: string | null;
  file_size: number | null;
  storage_path: string;
  storage_bucket: string;
  public_url: string | null;
  duration_seconds: number | null;
  dimensions: { width: number; height: number } | null;
  alt_text: string | null;
  created_at: string;
  created_by: string;
};

export const adminMediaColumns: ColumnDef<AdminMedia>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'original_filename',
    header: 'File',
    cell: ({ row }) => {
      const filename = row.getValue('original_filename') as string | null;
      const fileType = row.original.file_type;
      
      return (
        <div className="font-medium max-w-xs truncate" title={filename || 'Unnamed file'}>
          {filename || 'Unnamed file'}
          <div className="text-xs text-muted-foreground">
            {fileType.toUpperCase()}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'file_size',
    header: 'Size',
    cell: ({ row }) => {
      const size = row.getValue('file_size') as number | null;
      if (!size) return <span className="text-muted-foreground">Unknown</span>;
      
      // Convert bytes to human readable format
      if (size < 1024) {
        return <span>{size} B</span>;
      } else if (size < 1024 * 1024) {
        return <span>{Math.round(size / 1024)} KB</span>;
      } else if (size < 1024 * 1024 * 1024) {
        return <span>{Math.round(size / (1024 * 1024))} MB</span>;
      } else {
        return <span>{Math.round(size / (1024 * 1024 * 1024))} GB</span>;
      }
    },
  },
  {
    accessorKey: 'dimensions',
    header: 'Dimensions',
    cell: ({ row }) => {
      const dimensions = row.getValue('dimensions') as { width: number; height: number } | null;
      if (!dimensions) return <span className="text-muted-foreground">N/A</span>;
      
      return (
        <span>
          {dimensions.width}×{dimensions.height}
        </span>
      );
    },
  },
  {
    accessorKey: 'duration_seconds',
    header: 'Duration',
    cell: ({ row }) => {
      const duration = row.getValue('duration_seconds') as number | null;
      if (!duration) return <span className="text-muted-foreground">N/A</span>;
      
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      
      if (minutes > 0) {
        return (
          <span>
            {minutes}m {seconds > 0 ? `${seconds}s` : ''}
          </span>
        );
      }
      
      return <span>{seconds}s</span>;
    },
  },
  {
    accessorKey: 'storage_bucket',
    header: 'Storage',
    cell: ({ row }) => {
      const bucket = row.getValue('storage_bucket') as string;
      return (
        <Badge variant="outline">
          {bucket}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Uploaded',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const media = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {media.public_url && (
              <DropdownMenuItem asChild>
                <a href={media.public_url} target="_blank" rel="noopener noreferrer">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </a>
              </DropdownMenuItem>
            )}
            {media.public_url && (
              <DropdownMenuItem asChild>
                <a href={media.public_url} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];