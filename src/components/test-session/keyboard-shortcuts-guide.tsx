'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: 'Navigation' | 'Actions' | 'Tools';
}

const shortcuts: KeyboardShortcut[] = [
  // Navigation
  {
    keys: ['→', 'N'],
    description: 'Next question',
    category: 'Navigation',
  },
  {
    keys: ['←', 'P'],
    description: 'Previous question',
    category: 'Navigation',
  },
  {
    keys: ['Home'],
    description: 'First question',
    category: 'Navigation',
  },
  {
    keys: ['End'],
    description: 'Last question',
    category: 'Navigation',
  },

  // Actions
  {
    keys: ['Ctrl', 'Enter'],
    description: 'Submit answer',
    category: 'Actions',
  },
  {
    keys: ['F'],
    description: 'Flag/unflag question',
    category: 'Actions',
  },
  {
    keys: ['Space'],
    description: 'Pause/resume test',
    category: 'Actions',
  },
  {
    keys: ['Esc'],
    description: 'Exit full screen',
    category: 'Actions',
  },

  // Tools
  {
    keys: ['Ctrl', 'N'],
    description: 'Toggle scratch notepad',
    category: 'Tools',
  },
  {
    keys: ['?'],
    description: 'Show this shortcuts guide',
    category: 'Tools',
  },
  {
    keys: ['Ctrl', 'K'],
    description: 'Clear current answer',
    category: 'Tools',
  },
];

export function KeyboardShortcutsGuide() {
  const [open, setOpen] = useState(false);

  const categories = ['Navigation', 'Actions', 'Tools'] as const;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          <span className="text-xs">Shortcuts</span>
          <Badge variant="outline" className="text-xs">
            ?
          </Badge>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-blue-600" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and interact with the test
            more efficiently
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {categories.map((category) => {
            const categoryShortcuts = shortcuts.filter(
              (s) => s.category === category
            );

            return (
              <div key={category}>
                <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center">
                            {keyIndex > 0 && (
                              <span className="text-xs text-gray-400 mx-1">
                                +
                              </span>
                            )}
                            <Badge
                              variant="secondary"
                              className="font-mono text-xs px-2 py-1"
                            >
                              {key}
                            </Badge>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>💡 Pro Tip:</strong> Press{' '}
            <Badge
              variant="secondary"
              className="font-mono text-xs mx-1 inline-flex"
            >
              ?
            </Badge>{' '}
            at any time to see this shortcuts guide
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
