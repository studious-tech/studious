'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Shield, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Define the user type based on your database schema
export type AdminUser = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  target_exam: string | null;
  target_score: number | null;
  created_at: string;
  avatar_url?: string;
  subscription_status?: string;
};

export const adminUserColumns: ColumnDef<AdminUser>[] = [
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
    accessorKey: 'full_name',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original;
      
      const getInitials = (name: string | null) => {
        if (!name) return 'U';
        return name
          ?.split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase() || 'U';
      };
      
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {user.full_name || 'No Name'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      
      const getRoleBadgeVariant = (role: string) => {
        switch (role) {
          case 'admin':
            return 'destructive';
          case 'student':
            return 'default';
          default:
            return 'secondary';
        }
      };
      
      return (
        <Badge variant={getRoleBadgeVariant(role)}>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'target_exam',
    header: 'Target Exam',
    cell: ({ row }) => {
      const exam = row.getValue('target_exam') as string | null;
      if (!exam) return <span className="text-muted-foreground">Not set</span>;
      
      return (
        <Badge variant="outline">
          {exam.toUpperCase().replace('-', ' ')}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'target_score',
    header: 'Target Score',
    cell: ({ row }) => {
      const score = row.getValue('target_score') as number | null;
      if (!score) return <span className="text-muted-foreground">Not set</span>;
      
      return (
        <div className="flex items-center">
          <span className="font-medium">{score}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'subscription_status',
    header: 'Subscription',
    cell: ({ row }) => {
      const status = row.getValue('subscription_status') as string | undefined;
      if (!status) return <span className="text-muted-foreground">None</span>;
      
      const variant = status === 'active' ? 'default' : 'secondary';
      
      return (
        <Badge variant={variant}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Joined',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

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
            <DropdownMenuItem
              onClick={() => {
                // onUpdateRole implementation would go here
                // For now, we'll just log the action
                console.log(`Toggle role for user ${user.id}`);
              }}
            >
              {user.role === 'admin' ? (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Make Student
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Make Admin
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Deactivate User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];