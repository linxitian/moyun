import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg';

    const variants = {
      primary:
        'bg-[#1a1c23] text-white hover:bg-[#2e323e] dark:bg-[#f3f4f6] dark:text-[#121316] dark:hover:bg-[#e5e7eb] focus:ring-[#1a1c23]',
      secondary:
        'bg-[#e6e2d8] text-[#1a1c23] hover:bg-[#ded9cd] dark:bg-[#272a34] dark:text-[#f3f4f6] dark:hover:bg-[#343846] focus:ring-[#6b7280]',
      outline:
        'border border-[#d1d5db] text-[#1a1c23] hover:bg-[#f0ece1]/50 dark:border-[#393e4f] dark:text-[#f3f4f6] dark:hover:bg-[#272a34]/50 focus:ring-[#9ca3af]',
      ghost:
        'text-[#4f566b] hover:text-[#1a1c23] hover:bg-[#f0ece1]/40 dark:text-[#9ca3af] dark:hover:text-[#f3f4f6] dark:hover:bg-[#272a34]/40',
      danger:
        'bg-[#b83b3b] text-white hover:bg-[#9c2e2e] focus:ring-[#b83b3b]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-2.5 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
