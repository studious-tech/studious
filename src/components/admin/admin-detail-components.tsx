'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminDetailHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs: {
    label: string;
    href?: string;
  }[];
  status?: 'active' | 'inactive' | 'draft' | 'published';
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }[];
  onEdit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

export function AdminDetailHeader({
  title,
  subtitle,
  breadcrumbs,
  status,
  actions = [],
  onEdit,
  onDelete,
  loading = false,
}: AdminDetailHeaderProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-8 w-96" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {crumb.href ? (
                  <BreadcrumbLink href={crumb.href} className="cursor-pointer">
                    {crumb.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          <div className="flex items-center gap-2 mt-2">
            {status && (
              <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
          
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600" 
                      onClick={onDelete}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}

interface AdminDetailSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  }[];
}

export function AdminDetailSection({
  title,
  description,
  children,
  actions = [],
}: AdminDetailSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                size="sm"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}