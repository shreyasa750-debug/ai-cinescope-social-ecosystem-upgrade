"use client";

import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Exception: Allow '/' to open search even in input fields
        if (event.key !== '/') return;
      }

      shortcuts.forEach((shortcut) => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
        }
      });
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

// Predefined shortcuts
export const DEFAULT_SHORTCUTS = {
  SEARCH: { key: '/', description: 'Open search' },
  PLAY_PAUSE: { key: ' ', description: 'Play/Pause video' },
  ESCAPE: { key: 'Escape', description: 'Close dialog/modal' },
  NEXT: { key: 'ArrowRight', description: 'Next item' },
  PREVIOUS: { key: 'ArrowLeft', description: 'Previous item' },
  HOME: { key: 'h', description: 'Go to home' },
  DISCOVER: { key: 'd', description: 'Go to discover' },
  ANALYTICS: { key: 'a', description: 'Go to analytics' },
  SOCIAL: { key: 's', description: 'Go to social' },
  HELP: { key: '?', shift: true, description: 'Show shortcuts' },
};
