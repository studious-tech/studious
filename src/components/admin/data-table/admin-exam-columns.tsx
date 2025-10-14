'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Edit, Eye, Trash2, Play, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

// Define the exam type based on your database schema
export type AdminExam = {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  duration_minutes: number | null;
  total_score: number | null;
  is_active: boolean;
  created_at: string;
  sections?: {
    id: string;
    name: string;
    display_name: string;
    question_types?: {
      id: string;
      name: string;
      display_name: string;
    }[];
  }[];
};

export const adminExamColumns: ColumnDef<AdminExam>[] = [
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
    accessorKey: 'sections',
    header: 'Structure',
    cell: ({ row }) => {
      const sections = row.original.sections;
      if (!sections || sections.length === 0) {
        return <span className="text-muted-foreground">0 sections</span>;
      }
      
      const totalQuestionTypes = sections.reduce((total, section) => 
        total + (section.question_types?.length || 0), 0);
      
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {sections.length} {sections.length === 1 ? 'section' : 'sections'}
          </Badge>
          <Badge variant="outline">
            {totalQuestionTypes} {totalQuestionTypes === 1 ? 'type' : 'types'}
          </Badge>
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
    accessorKey: 'total_score',
    header: 'Max Score',
    cell: ({ row }) => {
      const score = row.getValue('total_score') as number | null;
      return <span>{score || 'N/A'}</span>;
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
      const exam = row.original;

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
              <Link href={`/admin/content/exams/${exam.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/content/exams/${exam.id}/edit`}>
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