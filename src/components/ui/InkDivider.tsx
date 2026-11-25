import React from 'react';
import { cn } from '@/lib/utils';

export interface InkDividerProps {
  className?: string;
  text?: string;
  width?: string;
  color?: string;
}

export function InkDivider({
  className,
  text,
  width = 'w-full',
  color,
}: InkDividerProps) {
  if (text) {
    return (
      <div className={cn('relative flex items-center justify-center my-8 select-none', width, className)}>
        <div className="flex-1 min-w-0 h-4 relative overflow-hidden">
          <svg
            className="w-full h-full text-zinc-400 dark:text-zinc-600 opacity-60"
            viewBox="0 0 500 16"
            preserveAspectRatio="none"
          >
            <path
              d="M0,8 Q125,2 250,9 T500,8"
              fill="none"
              stroke={color || 'currentColor'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="400"
              strokeDashoffset="0"
            />
            <path
              d="M50,9 Q200,12 350,8 T480,9"
              fill="none"
              stroke={color || 'currentColor'}
              strokeWidth="1"
              strokeOpacity="0.4"
            />
          </svg>
        </div>

        <span className="shrink-0 whitespace-nowrap px-4 text-xs tracking-widest font-serif text-[#6b7280] dark:text-[#9ca3af] uppercase bg-transparent">
          {text}
        </span>

        <div className="flex-1 min-w-0 h-4 relative overflow-hidden">
          <svg
            className="w-full h-full text-zinc-400 dark:text-zinc-600 opacity-60"
            viewBox="0 0 500 16"
            preserveAspectRatio="none"
          >
            <path
              d="M0,8 Q125,10 250,7 T500,8"
              fill="none"
              stroke={color || 'currentColor'}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M20,7 Q180,5 340,9 T450,7"
              fill="none"
              stroke={color || 'currentColor'}
              strokeWidth="1"
              strokeOpacity="0.4"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative my-8 overflow-hidden flex items-center justify-center', width, className)}>
      <svg
        className="w-full h-4 text-zinc-300 dark:text-zinc-700 opacity-70"
        viewBox="0 0 800 16"
        preserveAspectRatio="none"
      >
        {/* Main calligraphic ink streak that tapers at ends */}
        <path
          d="M20,8 C120,4 240,11 380,7 C520,3 660,10 780,8 C700,9 560,6 420,10 C280,12 140,7 20,8 Z"
          fill={color || 'currentColor'}
        />
        {/* Subtle dry brush splatter / accent marks */}
        <circle cx="400" cy="8" r="1.5" fill={color || 'currentColor'} opacity="0.6" />
        <circle cx="280" cy="9.5" r="1" fill={color || 'currentColor'} opacity="0.4" />
        <circle cx="520" cy="6.5" r="1.2" fill={color || 'currentColor'} opacity="0.5" />
      </svg>
    </div>
  );
}

export default InkDivider;
