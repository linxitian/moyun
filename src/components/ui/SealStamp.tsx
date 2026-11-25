import React from 'react';
import { cn } from '@/lib/utils';

export interface SealStampProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  rotate?: boolean;
}

export function SealStamp({
  size = 'md',
  text = '墨',
  className,
  rotate = true,
}: SealStampProps) {
  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-3xl',
  };

  const sizePixelStyles: Record<string, React.CSSProperties> = {
    xs: { width: '1.25rem', height: '1.25rem', minWidth: '1.25rem', minHeight: '1.25rem' },
    sm: { width: '2rem', height: '2rem', minWidth: '2rem', minHeight: '2rem' },
    md: { width: '2.5rem', height: '2.5rem', minWidth: '2.5rem', minHeight: '2.5rem' },
    lg: { width: '3.5rem', height: '3.5rem', minWidth: '3.5rem', minHeight: '3.5rem' },
    xl: { width: '5rem', height: '5rem', minWidth: '5rem', minHeight: '5rem' },
  };

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center select-none font-serif font-bold transition-transform duration-300',
        rotate && 'hover:rotate-0 -rotate-2',
        sizeClasses[size],
        className
      )}
      style={{
        ...sizePixelStyles[size],
        filter: 'drop-shadow(0 2px 4px rgba(184, 59, 59, 0.25))',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
        aria-hidden="true"
      >
        <defs>
          <filter id={`seal-rough-${size}`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Outer irregular border */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="10"
          ry="10"
          fill="#b83b3b"
          filter={`url(#seal-rough-${size})`}
        />

        {/* Inner frame cutout */}
        <rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="6"
          ry="6"
          fill="none"
          stroke="#faf8f5"
          strokeWidth="3.5"
          strokeOpacity="0.85"
        />

        {/* Vintage speckles for stone stamp authenticity */}
        <circle cx="20" cy="80" r="1.5" fill="#faf8f5" opacity="0.6" />
        <circle cx="78" cy="22" r="1.2" fill="#faf8f5" opacity="0.7" />
        <circle cx="82" cy="75" r="1.8" fill="#faf8f5" opacity="0.5" />
      </svg>

      {/* Character inside the seal */}
      <span
        className="relative z-10 text-[#faf8f5] font-serif font-extrabold tracking-widest leading-none drop-shadow-sm"
        style={{
          fontFamily: 'var(--font-serif)',
          textShadow: '0 0 1px rgba(0,0,0,0.3)',
        }}
      >
        {text}
      </span>
    </div>
  );
}
export default SealStamp;
