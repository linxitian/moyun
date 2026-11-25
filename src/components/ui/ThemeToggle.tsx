'use client';

import React, { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ThemeToggleProps {
  className?: string;
}

function applyTheme(newTheme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (newTheme === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('moyun-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getServerSnapshot(): 'light' | 'dark' {
  return 'light';
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('moyun-theme', nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? '切换为明纸模式' : '切换为暗墨模式'}
      title={theme === 'dark' ? '切换为明纸模式' : '切换为暗墨模式'}
      className={cn(
        'relative w-9 h-9 rounded-lg border border-[#e6e2d8] dark:border-[#2d313c] bg-[#ffffff]/80 dark:bg-[#1a1c22]/80 backdrop-blur-sm flex items-center justify-center text-[#4f566b] dark:text-[#9ca3af] hover:text-[#1a1c23] dark:hover:text-[#f3f4f6] hover:border-[#b83b3b] dark:hover:border-[#d24e4e] transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b83b3b]/30',
        className
      )}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-[#ffb74d] transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#2d3a4b] transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}

export default ThemeToggle;
