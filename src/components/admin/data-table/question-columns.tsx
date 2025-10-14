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
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

// Define the question type based on your database schema
export type Question = {
  id: string;
  title: string;
  content: string;
  question_type_id: string;
  difficulty_level: number;
  is_active: boolean;
  created_at: string;
  question_types?: {
    display_name: string;
    sections: {
      display_name: string;
      exams: {
        display_name: string;
      };
    };
  };
};

export const questionColumns: ColumnDef<Question>[] = [
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
    header: 'Question',
    cell: ({ row }) => {
      const question = row.original;
      return (
        <div className="font-medium">
          {question.title || 'Untitled Question'}
          <div className="text-sm text-muted-foreground line-clamp-1">
            {question.content?.substring(0, 60)}...
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'question_types',
    header: 'Type',
    cell: ({ row }) => {
      const question = row.original;
      if (!question.question_types) {
        return <span className="text-muted-foreground">Unknown</span>;
      }
      return (
        <Badge variant="outline" className="text-xs">
          {question.question_types.display_name}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'question_types.sections.exams',
    header: 'Exam',
    cell: ({ row }) => {
      const question = row.original;
      if (!question.question_types?.sections?.exams) {
        return <span className="text-muted-foreground">N/A</span>;
      }
      return (
        <span className="text-sm font-medium">
          {question.question_types.sections.exams.display_name}
        </span>
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
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const question = row.original;
      const isActive = row.getValue('is_active') as boolean;
      
      // In a real implementation, we would call onToggleStatus
      // For now, we'll just show the switch without functionality
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={isActive}
            // onCheckedChange={() => onToggleStatus(question.id)}
          />
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
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
              <Link href={`/admin/questions/${question.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/questions/${question.id}/edit`}>
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