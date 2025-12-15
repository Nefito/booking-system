'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  const updateTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;

    // Direct DOM manipulation - no requestAnimationFrame needed
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('theme', newTheme);

    // Enhanced logging
    console.log('Theme update complete:');
    console.log('  - New theme:', newTheme);
    console.log('  - HTML classes:', root.className);
    console.log('  - Has dark class?', root.classList.contains('dark'));
    console.log('  - All classes on html:', Array.from(root.classList));

    // Force browser to recognize the change by triggering a reflow
    void root.offsetHeight;
  };

  useEffect(() => {
    // Check localStorage and system preference
    // Default to dark theme if no preference is stored
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = stored || (systemPrefersDark ? 'dark' : 'light'); // Default to dark

    // Defer state updates to avoid synchronous setState in effect
    requestAnimationFrame(() => {
      setMounted(true);
      setTheme(initialTheme);
      updateTheme(initialTheme);
    });
  }, []);

  const toggleTheme = () => {
    console.log('Theme toggle clicked! Current theme:', theme);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Switching to theme:', newTheme);

    // Update state first
    setTheme(newTheme);

    // Update DOM immediately
    updateTheme(newTheme);

    // Verify after a brief delay
    setTimeout(() => {
      const root = document.documentElement;
      console.log('After update - HTML classes:', root.className);
      console.log('After update - Has dark class?', root.classList.contains('dark'));
      console.log('After update - Computed styles:', window.getComputedStyle(root).colorScheme);
    }, 100);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="relative" aria-label="Toggle theme" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Button clicked!');
        toggleTheme();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800 h-10 w-10 relative z-50 cursor-pointer"
      aria-label="Toggle theme"
      type="button"
      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all text-zinc-900 dark:-rotate-90 dark:scale-0 dark:text-zinc-50 pointer-events-none" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all text-zinc-900 dark:rotate-0 dark:scale-100 dark:text-zinc-50 pointer-events-none" />
    </button>
  );
}
