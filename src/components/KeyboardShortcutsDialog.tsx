"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS = [
  {
    category: 'Navigation',
    shortcuts: [
      { keys: ['H'], description: 'Go to Home' },
      { keys: ['D'], description: 'Go to Discover' },
      { keys: ['A'], description: 'Go to Analytics' },
      { keys: ['S'], description: 'Go to Social' },
      { keys: ['/'], description: 'Focus Search' },
      { keys: ['Esc'], description: 'Close Dialog' },
    ],
  },
  {
    category: 'Video Controls',
    shortcuts: [
      { keys: ['Space'], description: 'Play/Pause' },
      { keys: ['→'], description: 'Forward 10s' },
      { keys: ['←'], description: 'Backward 10s' },
      { keys: ['↑'], description: 'Volume Up' },
      { keys: ['↓'], description: 'Volume Down' },
      { keys: ['M'], description: 'Mute/Unmute' },
      { keys: ['F'], description: 'Fullscreen' },
    ],
  },
  {
    category: 'Actions',
    shortcuts: [
      { keys: ['Ctrl', 'K'], description: 'Command Palette' },
      { keys: ['?'], description: 'Show Shortcuts' },
      { keys: ['Ctrl', 'S'], description: 'Save/Bookmark' },
      { keys: ['Ctrl', 'Enter'], description: 'Submit Form' },
    ],
  },
  {
    category: 'Lists',
    shortcuts: [
      { keys: ['↑'], description: 'Move Item Up' },
      { keys: ['↓'], description: 'Move Item Down' },
      { keys: ['Enter'], description: 'Select Item' },
      { keys: ['Delete'], description: 'Remove Item' },
    ],
  },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate CineScope faster
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {SHORTCUTS.map((category) => (
            <div key={category.category} className="space-y-3">
              <h3 className="font-semibold text-lg">{category.category}</h3>
              <Card className="p-4">
                <div className="space-y-3">
                  {category.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <div key={keyIndex} className="flex items-center gap-1">
                            <Badge variant="outline" className="font-mono">
                              {key === 'Ctrl' && (
                                <Command className="h-3 w-3 mr-1" />
                              )}
                              {key}
                            </Badge>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground">+</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground pt-4 border-t">
          Press <Badge variant="outline" className="mx-1">?</Badge> anytime to view shortcuts
        </div>
      </DialogContent>
    </Dialog>
  );
}
