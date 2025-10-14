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
export type AdminQuestionType = {
  id: string;
  section_id: string;
  name: string;
  display_name: string;
  description: string | null;
  input_type: string;
  response_type: string;
  scoring_method: string;
  time_limit_seconds: number | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  ui_component: string | null;
  question_count?: number;
  section?: {
    id: string;
    name: string;
    display_name: string;
    exam?: {
      id: string;
      name: string;
      display_name: string;
    };
  };
};

export const adminQuestionTypeColumns: ColumnDef<AdminQuestionType>[] = [
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
        <Badge variant="outline" className="ml-2 text-xs">
          #{row.original.order_index}
        </Badge>
        {!row.original.is_active && (
          <Badge variant="secondary" className="ml-2">
            Inactive
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Identifier',
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return (
        <div className="font-mono text-sm">
          {name}
        </div>
      );
    },
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
    accessorKey: 'section',
    header: 'Section',
    cell: ({ row }) => {
      const section = row.original.section;
      if (!section) return <span className="text-muted-foreground">No section</span>;
      
      return (
        <div className="space-y-1">
          <div className="font-medium">{section.display_name}</div>
          <div className="text-xs text-muted-foreground">
            {section.exam?.display_name || 'No exam'}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'input_type',
    header: 'Input',
    cell: ({ row }) => {
      const inputType = row.getValue('input_type') as string;
      return (
        <Badge variant="outline" className="text-xs">
          {inputType}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'response_type',
    header: 'Response',
    cell: ({ row }) => {
      const responseType = row.getValue('response_type') as string;
      return (
        <Badge variant="outline" className="text-xs">
          {responseType}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'scoring_method',
    header: 'Scoring',
    cell: ({ row }) => {
      const scoringMethod = row.getValue('scoring_method') as string;
      return (
        <Badge variant="secondary" className="text-xs">
          {scoringMethod}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'ui_component',
    header: 'UI Component',
    cell: ({ row }) => {
      const uiComponent = row.getValue('ui_component') as string | null;
      
      if (!uiComponent) {
        return (
          <Badge variant="destructive" className="text-xs">
            Missing
          </Badge>
        );
      }
      
      return (
        <Badge variant="default" className="text-xs">
          {uiComponent}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'question_count',
    header: 'Questions',
    cell: ({ row }) => {
      const count = row.getValue('question_count') as number | undefined;
      return <span>{count || 0}</span>;
    },
  },
  {
    accessorKey: 'time_limit_seconds',
    header: 'Time Limit',
    cell: ({ row }) => {
      const timeLimit = row.getValue('time_limit_seconds') as number | null;
      if (!timeLimit) return <span className="text-muted-foreground">None</span>;
      
      const minutes = Math.floor(timeLimit / 60);
      const seconds = timeLimit % 60;
      
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
    accessorKey: 'order_index',
    header: 'Order',
    cell: ({ row }) => {
      return <span>#{row.getValue('order_index')}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const questionType = row.original;

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
              <Link href={`/admin/content/question-types/${questionType.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/content/question-types/${questionType.id}/edit`}>
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