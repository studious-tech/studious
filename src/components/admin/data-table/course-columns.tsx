'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Edit, Eye, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

// Define the course type based on your database schema
export type Course = {
  id: string;
  exam_id: string;
  name: string;
  display_name: string;
  description: string | null;
  thumbnail_media_id: string | null;
  difficulty_level: number;
  duration_minutes: number | null;
  is_active: boolean;
  is_premium: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  exam?: {
    id: string;
    name: string;
    display_name: string;
  };
  modules?: {
    id: string;
    name: string;
    display_name: string;
    is_active: boolean;
  }[];
  materials?: {
    id: string;
    name: string;
    display_name: string;
    file_type: string | null;
    file_size: number | null;
    is_active: boolean;
  }[];
};

export const courseColumns: ColumnDef<Course>[] = [
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
    accessorKey: 'display_name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('display_name')}
        {!row.original.is_active && (
          <Badge variant="secondary" className="ml-2">
            Inactive
          </Badge>
        )}
        {row.original.is_premium && (
          <Badge variant="outline" className="ml-2">
            Premium
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null;
      if (!description) return <span className="text-muted-foreground">No description</span>;
      
      // Truncate long descriptions and add tooltip/hover effect
      return (
        <div className="max-w-xs truncate" title={description}>
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: 'exam',
    header: 'Exam',
    cell: ({ row }) => {
      const exam = row.original.exam;
      if (!exam) return <span className="text-muted-foreground">No exam</span>;
      
      return (
        <Badge variant="outline">
          {exam.display_name}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'modules',
    header: 'Modules',
    cell: ({ row }) => {
      const modules = row.original.modules;
      if (!modules || modules.length === 0) {
        return <span className="text-muted-foreground">0 modules</span>;
      }
      
      const activeModules = modules.filter(m => m.is_active).length;
      
      return (
        <div className="flex items-center gap-1">
          <Badge variant="outline">
            {modules.length} total
          </Badge>
          {activeModules !== modules.length && (
            <Badge variant="secondary">
              {activeModules} active
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'materials',
    header: 'Materials',
    cell: ({ row }) => {
      const materials = row.original.materials;
      if (!materials || materials.length === 0) {
        return <span className="text-muted-foreground">0 materials</span>;
      }
      
      return (
        <Badge variant="outline">
          {materials.length} material{materials.length !== 1 ? 's' : ''}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'difficulty_level',
    header: 'Difficulty',
    cell: ({ row }) => {
      const level = row.getValue('difficulty_level') as number;
      
      return (
        <div className="flex items-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full mr-1 ${i < level ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          <span className="ml-2 text-xs text-muted-foreground">Level {level}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'duration_minutes',
    header: 'Duration',
    cell: ({ row }) => {
      const duration = row.getValue('duration_minutes') as number | null;
      if (!duration) return <span className="text-muted-foreground">Not set</span>;
      
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      
      if (hours > 0) {
        return (
          <span>
            {hours}h {minutes > 0 ? `${minutes}m` : ''}
          </span>
        );
      }
      
      return <span>{minutes}m</span>;
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const course = row.original;

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
            <DropdownMenuItem asChild>
              <Link href={`/admin/content/courses/${course.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/content/courses/${course.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
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