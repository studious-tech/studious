'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Edit, Eye, Trash2, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

// Define the question type based on your database schema
export type AdminQuestion = {
  id: string;
  question_type_id: string;
  title: string | null;
  content: string | null;
  instructions: string | null;
  difficulty_level: number;
  expected_duration_seconds: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  question_media?: {
    id: string;
    media_role: string;
  }[];
  question_options?: {
    id: string;
    is_correct: boolean;
  }[];
  question_types?: {
    id: string;
    display_name: string;
    sections?: {
      id: string;
      display_name: string;
      exams?: {
        id: string;
        display_name: string;
      };
    };
  };
};

export const adminQuestionColumns: ColumnDef<AdminQuestion>[] = [
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
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const title = row.getValue('title') as string | null;
      if (!title) return <span className="text-muted-foreground">Untitled</span>;
      
      return (
        <div className="font-medium max-w-xs truncate" title={title}>
          {title}
        </div>
      );
    },
  },
  {
    accessorKey: 'question_types',
    header: 'Question Type',
    cell: ({ row }) => {
      const questionType = row.original.question_types;
      if (!questionType) return <span className="text-muted-foreground">Unknown</span>;
      
      return (
        <Badge variant="outline" className="text-xs">
          {questionType.display_name}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'question_types.sections',
    header: 'Section',
    cell: ({ row }) => {
      const section = row.original.question_types?.sections;
      if (!section) return <span className="text-muted-foreground">N/A</span>;
      
      return (
        <div className="text-sm">
          <div className="font-medium">{section.display_name}</div>
          <div className="text-xs text-muted-foreground">
            {section.exams?.display_name || 'Unknown Exam'}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'difficulty_level',
    header: 'Difficulty',
    cell: ({ row }) => {
      const level = row.getValue('difficulty_level') as number;
      return (
        <Badge variant="secondary">
          Level {level}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'expected_duration_seconds',
    header: 'Expected Time',
    cell: ({ row }) => {
      const duration = row.getValue('expected_duration_seconds') as number | null;
      if (!duration) return <span className="text-muted-foreground">Not set</span>;
      
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
    accessorKey: 'question_media',
    header: 'Media',
    cell: ({ row }) => {
      const media = row.original.question_media;
      if (!media || media.length === 0) {
        return <span className="text-muted-foreground">None</span>;
      }
      
      return (
        <Badge variant="outline">
          {media.length} {media.length === 1 ? 'item' : 'items'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'question_options',
    header: 'Options',
    cell: ({ row }) => {
      const options = row.original.question_options;
      if (!options || options.length === 0) {
        return <span className="text-muted-foreground">None</span>;
      }
      
      const correctOptions = options.filter(opt => opt.is_correct).length;
      
      return (
        <div className="flex items-center gap-1">
          <Badge variant="outline">
            {options.length} {options.length === 1 ? 'option' : 'options'}
          </Badge>
          {correctOptions > 0 && (
            <Badge variant="secondary">
              {correctOptions} correct
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
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
      const question = row.original;

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
              <Link href={`/admin/content/questions/${question.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/content/questions/${question.id}/edit`}>
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