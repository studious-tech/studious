'use client';

import { useExamStore } from '@/stores/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock,
  BookOpen,
  Users,
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Plus,
  List,
  Grid3X3,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';

interface ExamListProps {
  viewMode?: 'list' | 'grid';
  onSelectExam?: (exam: any) => void;
  onEditExam?: (exam: any) => void;
}

export function ExamList({ viewMode = 'grid', onSelectExam, onEditExam }: ExamListProps) {
  const { exams, loading, fetchExam, deleteExam } = useExamStore();
  const router = useRouter();

  const handleSelectExam = async (exam: any) => {
    try {
      await fetchExam(exam.id);
      if (onSelectExam) {
        onSelectExam(exam);
      } else {
        // Default navigation
        router.push(`/admin/content/exams/${exam.id}`);
      }
    } catch (error) {
      toast.error('Failed to load exam details');
    }
  };

  const handleDeleteExam = async (examId: string, examName: string) => {
    if (confirm(`Are you sure you want to delete "${examName}"? This will also delete all sections, question types, and questions.`)) {
      try {
        await deleteExam(examId);
        toast.success('Exam deleted successfully');
      } catch (error) {
        toast.error('Failed to delete exam');
      }
    }
  };

  if (loading) {
    if (viewMode === 'list') {
      return (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Structure</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Structure</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="font-medium">{exam.display_name}</div>
                  <div className="text-sm text-gray-500">{exam.name}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={exam.is_active ? 'default' : 'secondary'}>
                    {exam.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {exam.duration_minutes ? `${exam.duration_minutes}m` : 'N/A'}
                </TableCell>
                <TableCell>{exam.total_score}</TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    <div>{exam.sections?.length || 0} Sections</div>
                    <div>
                      {exam.sections?.reduce((total, section) => 
                        total + (section.question_types?.length || 0), 0
                      ) || 0} Types
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSelectExam(exam)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Structure
                      </DropdownMenuItem>
                      {onEditExam && (
                        <DropdownMenuItem onClick={() => onEditExam(exam)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Exam
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteExam(exam.id, exam.display_name)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {exams.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No exams found
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first exam
            </p>
            <Button onClick={() => router.push('/admin/content/exams/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Exam
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => (
        <Card key={exam.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{exam.display_name}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{exam.name}</p>
              </div>
              <Badge variant={exam.is_active ? 'default' : 'secondary'}>
                {exam.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {exam.description || 'No description provided'}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {exam.duration_minutes && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {exam.duration_minutes}m
                </Badge>
              )}
              
              <Badge variant="outline" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Score: {exam.total_score}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>{exam.sections?.length || 0} Sections</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>
                  {exam.sections?.reduce((total, section) => 
                    total + (section.question_types?.length || 0), 0
                  ) || 0} Types
                </span>
              </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSelectExam(exam)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSelectExam(exam)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Structure
                  </DropdownMenuItem>
                  {onEditExam && (
                    <DropdownMenuItem onClick={() => onEditExam(exam)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Exam
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => handleDeleteExam(exam.id, exam.display_name)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {exams.length === 0 && (
        <div className="col-span-full">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No exams found
              </h3>
              <p className="text-gray-500 text-center mb-4">
                Get started by creating your first exam
              </p>
              <Button onClick={() => router.push('/admin/content/exams/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Exam
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}