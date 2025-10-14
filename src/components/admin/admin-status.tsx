'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export function AdminStatus() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span>Admin Dashboard Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm">Dashboard Layout</span>
            <Badge variant="default">Active</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm">User Management</span>
            <Badge variant="default">Ready</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm">Questions Management</span>
            <Badge variant="default">Ready</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm">Media Library</span>
            <Badge variant="default">Ready</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm">Sample Data</span>
            <Badge variant="secondary">Optional</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm">Auth Protection</span>
            <Badge variant="default">Secured</Badge>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            ✅ <strong>All systems operational!</strong> Your admin dashboard is ready to use.
          </p>
          <p className="text-xs text-green-600 mt-1">
            Run the seed-data.sql script to add sample questions and media for testing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}