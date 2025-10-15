'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save, Trash2, Minimize2, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

interface ScratchNotepadProps {
  sessionId: string;
  questionId?: string;
}

export function ScratchNotepad({ sessionId, questionId }: ScratchNotepadProps) {
  const [notes, setNotes] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    const storageKey = questionId
      ? `notes-${sessionId}-${questionId}`
      : `notes-${sessionId}-general`;
    const savedNotes = localStorage.getItem(storageKey);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [sessionId, questionId]);

  // Auto-save notes to localStorage
  useEffect(() => {
    const storageKey = questionId
      ? `notes-${sessionId}-${questionId}`
      : `notes-${sessionId}-general`;

    const timer = setTimeout(() => {
      if (notes !== localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, notes);
        setLastSaved(new Date());
      }
    }, 1000); // Auto-save after 1 second of no typing

    return () => clearTimeout(timer);
  }, [notes, sessionId, questionId]);

  const handleClear = () => {
    if (notes && !window.confirm('Are you sure you want to clear all notes?')) {
      return;
    }
    setNotes('');
    const storageKey = questionId
      ? `notes-${sessionId}-${questionId}`
      : `notes-${sessionId}-general`;
    localStorage.removeItem(storageKey);
    toast.success('Notes cleared');
  };

  const handleManualSave = () => {
    setIsSaving(true);
    const storageKey = questionId
      ? `notes-${sessionId}-${questionId}`
      : `notes-${sessionId}-general`;
    localStorage.setItem(storageKey, notes);
    setLastSaved(new Date());
    toast.success('Notes saved');
    setTimeout(() => setIsSaving(false), 500);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastSaved.toLocaleTimeString();
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsMinimized(false)}
          size="sm"
          className="shadow-lg"
        >
          <FileText className="h-4 w-4 mr-2" />
          Show Notes
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 z-40">
      <Card className="shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">Scratch Notes</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="h-7 w-7"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {questionId ? 'Question-specific notes' : 'General test notes'}
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          <Textarea
            placeholder="Jot down your thoughts, calculations, or key points here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[200px] resize-none text-sm"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatLastSaved()}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!notes}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSave}
                disabled={isSaving || !notes}
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2 border-t">
            💡 Notes are saved automatically and stored locally
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
