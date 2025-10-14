'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Trash2, LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DangerZone() {
  const [email, setEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = () => {
    // Simulate account deletion
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      // In a real app, this would redirect to login or homepage
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Sign Out</h3>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You will be signed out from all devices. You&apos;ll need to sign in again to access your account.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out from All Devices
          </Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Delete Account</h3>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            This action is irreversible. All your data, including progress, test results, and personal information, will be permanently deleted.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2 mt-4">
          <Label htmlFor="confirm-email">
            Confirm your email to proceed
          </Label>
          <Input
            id="confirm-email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Please type your email address to confirm account deletion.
          </p>
        </div>
        
        <div className="mt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={email !== 'john.doe@example.com' || isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove all data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                  Yes, Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}