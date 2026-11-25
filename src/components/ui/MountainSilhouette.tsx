import React from 'react';
import { cn } from '@/lib/utils';

export interface MountainSilhouetteProps {
  className?: string;
  opacity?: number;
  height?: number;
}

export function MountainSilhouette({
  className,
  opacity = 0.85,
  height = 140,
}: MountainSilhouetteProps) {
  return (
    <div
      className={cn('relative w-full overflow-hidden pointer-events-none select-none', className)}
      style={{ height: `${height}px`, opacity }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="mountain-grad-1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="mountain-grad-2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="mountain-grad-3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Far mountains (淡墨远山) */}
        <path
          d="M0,130 C120,110 240,60 360,95 C480,130 580,70 720,105 C860,140 980,50 1120,80 C1260,110 1360,65 1440,90 L1440,220 L0,220 Z"
          fill="url(#mountain-grad-1)"
          className="text-[#2d3a4b] dark:text-[#9ca3af]"
        />

        {/* Mid-range mountains (重墨中景) */}
        <path
          d="M0,155 C160,125 280,165 420,135 C560,105 680,150 820,125 C960,100 1100,160 1240,130 C1340,110 1400,145 1440,150 L1440,220 L0,220 Z"
          fill="url(#mountain-grad-2)"
          className="text-[#1a1c23] dark:text-[#6b7280]"
        />

        {/* Near peaks & ink wash mist (浓墨近峰) */}
        <path
          d="M0,180 C110,160 210,190 320,168 C430,146 520,185 640,160 C760,135 880,180 1010,155 C1140,130 1280,185 1440,170 L1440,220 L0,220 Z"
          fill="url(#mountain-grad-3)"
          className="text-[#1a1c23] dark:text-[#393e4f]"
        />

        {/* A tiny lone boat silhouette in the mist */}
        <g
          transform="translate(890, 168) scale(0.65)"
          className="text-[#1a1c23] dark:text-[#f3f4f6] opacity-75"
        >
          <path
            d="M5,12 C12,11 20,11 28,12 C30,13 32,15 26,15.5 C15,16.5 7,15.5 3,14 C2,13.5 3,12.5 5,12 Z"
            fill="currentColor"
          />
          {/* Fisherman / oar silhouette */}
          <line x1="18" y1="12" x2="16" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <circle cx="16" cy="5" r="1.2" fill="currentColor" />
          <line x1="14" y1="9" x2="11" y2="16" stroke="currentColor" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
}

export default MountainSilhouette;
