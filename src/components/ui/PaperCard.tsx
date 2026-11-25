import React from 'react';
import { cn } from '@/lib/utils';

export interface PaperCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  bordered?: boolean;
}

export function PaperCard({
  children,
  className,
  hoverEffect = true,
  bordered = true,
  ...props
}: PaperCardProps) {
  return (
    <div
      className={cn(
        'relative bg-[#ffffff] dark:bg-[#1a1c22] rounded-xl transition-all duration-300 overflow-hidden',
        bordered && 'border border-[#e6e2d8] dark:border-[#2d313c]',
        hoverEffect && 'hover:shadow-lg hover:-translate-y-1 hover:border-[#d1cbd0] dark:hover:border-[#393e4f]',
        'shadow-[0_2px_12px_rgba(26,28,35,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]',
        className
      )}
      {...props}
    >
      {/* Subtle Xuan paper grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-10 paper-texture"
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default PaperCard;
