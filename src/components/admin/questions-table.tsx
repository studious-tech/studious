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
import { DataTable } from '@/components/admin/data-table/data-table';
import { questionColumns, Question } from '@/components/admin/data-table/question-columns';
import Link from 'next/link';

interface QuestionsTableProps {
  questions: Question[];
  loading: boolean;
  onToggleStatus: (questionId: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export function QuestionsTable({
  questions,
  loading,
  onToggleStatus,
  onLoadMore,
  hasMore,
}: QuestionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // In a real implementation, we would filter the data based on these filters
  // For now, we'll pass the full data set to the table

  return (
    <div className="space-y-4">
      {/* Header and Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Questions Management</CardTitle>
            <CardDescription>
              Manage exam questions and content
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/questions/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
                <SelectItem value="4">Level 4</SelectItem>
                <SelectItem value="5">Level 5</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <DataTable
        columns={questionColumns}
        data={questions}
        title="All Questions"
        description="Browse and manage all exam questions"
        filterPlaceholder="Search questions..."
        filterKey="title"
        actionButton={
          <Button asChild>
            <Link href="/admin/questions/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Link>
          </Button>
        }
      />
      
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}