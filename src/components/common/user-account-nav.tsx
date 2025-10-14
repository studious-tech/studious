'use client';
import { Lock, LogOut, Settings, Ticket, Heart } from 'lucide-react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Drawer } from 'vaul';

import { useMediaQuery } from '@/hooks/use-media-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/common/user-avatar';
import { Button } from '../ui/button';
import { handleLogout } from '@/lib/auth/logout';
import { useAuth } from '@/providers/auth-provider';

export function UserAccountNav() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, loading } = useAuth();

  // Check if user is admin
  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/check-access', {
        // Add cache: 'no-store' to prevent caching
        cache: 'no-store',
        // Add a timestamp to prevent caching
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setIsAdmin(data.isAdmin);
      } else {
        console.error('Error checking admin status:', data.error);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const closeDrawer = () => {
    setOpen(false);
  };

  const handleSignOut = async () => {
    closeDrawer();
    await handleLogout();
  };

  const { isMobile } = useMediaQuery();

  if (loading) {
    return (
      <div className="size-8 animate-pulse rounded-full border bg-muted" />
    );
  }

  if (!user) {
    return (
      <div className="size-8 animate-pulse rounded-full border bg-muted" />
    );
  }

  const userName =
    user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  const userAvatar = user.user_metadata?.avatar_url || null;

  if (isMobile) {
    return (
      <Drawer.Root open={open} onClose={closeDrawer}>
        <Drawer.Trigger onClick={() => setOpen(true)}>
          <Button variant="link" className="p-4">
            <div className="flex gap-2 p-2">
              <UserAvatar
                user={{
                  name: userName,
                  avatar_url: userAvatar,
                }}
                className="size-9 border"
              />
              <div className="flex flex-col text-start">
                <p className="font-medium">{userName}</p>
                {user.email && (
                  <p className="w-[200px] truncate text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          </Button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay
            className="fixed inset-0 z-40 h-full bg-background/80 backdrop-blur-sm"
            onClick={closeDrawer}
          />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 overflow-hidden rounded-t-[10px] border bg-background px-3 text-sm">
            <div className="sticky top-0 z-20 flex w-full items-center justify-center bg-inherit">
              <div className="my-3 h-1.5 w-16 rounded-full bg-muted-foreground/20" />
            </div>

            <div className="flex items-center justify-start gap-2 p-2">
              <UserAvatar
                user={{
                  name: userName,
                  avatar_url: userAvatar,
                }}
                className="size-9 border"
              />
              <div className="flex flex-col">
                <p className="font-medium">{userName}</p>
                {user.email && (
                  <p className="w-[200px] truncate text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            <ul role="list" className="mb-14 mt-1 w-full text-muted-foreground">
              {/* Add role check if you have roles in user_metadata */}
              {isAdmin && (
                <li className="rounded-lg text-foreground hover:bg-muted">
                  <Link
                    href="/admin"
                    onClick={closeDrawer}
                    className="flex w-full items-center gap-3 px-2.5 py-2"
                  >
                    <Lock className="size-4" />
                    <p className="text-sm">Admin</p>
                  </Link>
                </li>
              )}

              {/* Removed My Organizations button */}
              <li className="rounded-lg text-foreground hover:bg-muted">
                <Link
                  href="/favorites"
                  onClick={closeDrawer}
                  className="flex w-full items-center gap-3 px-2.5 py-2"
                >
                  <Heart className="size-4" />
                  <p className="text-sm">My Favourites</p>
                </Link>
              </li>
              <li className="rounded-lg text-foreground hover:bg-muted">
                <Link
                  href="/settings"
                  onClick={closeDrawer}
                  className="flex w-full items-center gap-3 px-2.5 py-2"
                >
                  <Settings className="size-4" />
                  <p className="text-sm">Settings</p>
                </Link>
              </li>

              <li
                className="rounded-lg text-foreground hover:bg-muted"
                onClick={handleSignOut}
              >
                <div className="flex w-full items-center gap-3 px-2.5 py-2 cursor-pointer">
                  <LogOut className="size-4" />
                  <p className="text-sm">Log out</p>
                </div>
              </li>
            </ul>
          </Drawer.Content>
          <Drawer.Overlay />
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{
            name: userName,
            avatar_url: userAvatar,
          }}
          className="size-8 border"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <UserAvatar
            user={{
              name: userName,
              avatar_url: userAvatar,
            }}
            className="size-9 border"
          />
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{userName}</p>
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center space-x-2.5">
              <Lock className="size-4" />
              <p className="text-sm">Admin</p>
            </Link>
          </DropdownMenuItem>
        )}

        {/* Removed My Organizations button */}
        <DropdownMenuItem asChild>
          <Link href="/favorites" className="flex items-center space-x-2.5">
            <Heart className="size-4" />
            <p className="text-sm">My Favourites</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/tickets" className="flex items-center space-x-2.5">
            <Ticket className="size-4" />
            <p className="text-sm">Tickets</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center space-x-2.5">
            <Settings className="size-4" />
            <p className="text-sm">Settings</p>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
          <div className="flex items-center space-x-2.5">
            <LogOut className="size-4" />
            <p className="text-sm">Log out</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
