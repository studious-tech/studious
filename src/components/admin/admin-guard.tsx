'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const supabase = createClient();
        
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setIsAdmin(profile.role === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Checking permissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="text-center">
              <Shield className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Access Denied
              </h1>
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You need administrator privileges to access this page.
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/">
                    Return to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/signin">
                    Sign In as Admin
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}