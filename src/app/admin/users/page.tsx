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
import { Search, Plus } from 'lucide-react';
import { AdminDataTable } from '@/components/admin/data-table/admin-data-table';
import { adminUserColumns, AdminUser } from '@/components/admin/data-table/admin-user-columns';
import { useAdminStore } from '@/stores/admin';

interface UsersPageProps {
  users: AdminUser[];
  loading: boolean;
  onUpdateRole: (userId: string, role: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function UsersPage() {
  const { users, usersLoading, fetchUsers, updateUserRole } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [examFilter, setExamFilter] = useState<string>('');

  // In a real implementation, we would filter the data based on these filters
  // For now, we'll pass the full data set to the table

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role);
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleLoadMore = () => {
    // Implementation would go here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and roles
          </p>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search and filter users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={examFilter} onValueChange={setExamFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                <SelectItem value="pte-academic">PTE Academic</SelectItem>
                <SelectItem value="ielts-academic">IELTS Academic</SelectItem>
                <SelectItem value="ielts-general">IELTS General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'student').length}
              </p>
              <p className="text-sm text-gray-500">Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => u.role === 'admin').length}
              </p>
              <p className="text-sm text-gray-500">Admins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.subscription_status === 'active').length}
              </p>
              <p className="text-sm text-gray-500">Active Subs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <AdminDataTable
        columns={adminUserColumns}
        data={users as AdminUser[]}
        title="All Users"
        description="Browse and manage all platform users"
        filterPlaceholder="Search users..."
        filterKey="full_name"
        actionButton={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        }
      />
    </div>
  );
}