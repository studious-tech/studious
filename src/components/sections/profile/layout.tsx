'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function ProfileLayout({ 
  children,
  title,
  description
}: { 
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex flex-col gap-6">
            {/* Profile Header - Stacked on mobile, side-by-side on desktop */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-64 flex-shrink-0">
                <Card>
                  <CardHeader className="flex flex-col items-center">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="text-center mt-4">
                      <CardTitle className="text-lg">John Doe</CardTitle>
                      <CardDescription>john.doe@example.com</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Content */}
              <div className="flex-1">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold">{title}</h1>
                      <p className="text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}