import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'accent' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default:
      'bg-[#1a1c23]/10 text-[#1a1c23] dark:bg-[#f3f4f6]/10 dark:text-[#f3f4f6]',
    secondary:
      'bg-[#e6e2d8] text-[#4f566b] dark:bg-[#272a34] dark:text-[#9ca3af]',
    accent:
      'bg-[#b83b3b]/10 text-[#b83b3b] dark:bg-[#d24e4e]/20 dark:text-[#f87171]',
    outline:
      'border border-[#d1d5db] text-[#4f566b] dark:border-[#393e4f] dark:text-[#9ca3af]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
