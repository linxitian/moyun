'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface InkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'cinnabar';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  href?: string;
  target?: string;
  rel?: string;
}

export function InkButton({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  href,
  target,
  rel,
  children,
  className,
  disabled,
  ...props
}: InkButtonProps) {
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg overflow-hidden group select-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3 text-base gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#1a1c23] text-[#faf8f5] hover:bg-[#272a34] dark:bg-[#f3f4f6] dark:text-[#121316] dark:hover:bg-[#e5e7eb] shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:ring-[#1a1c23]',
    secondary:
      'bg-[#f5f2eb] text-[#1a1c23] border border-[#e6e2d8] hover:bg-[#eae4d5] dark:bg-[#1a1c22] dark:text-[#f3f4f6] dark:border-[#2d313c] dark:hover:bg-[#272a34] shadow-sm hover:shadow hover:-translate-y-0.5 focus:ring-[#9ca3af]',
    ghost:
      'text-[#4f566b] hover:text-[#1a1c23] hover:bg-[#f0ece1]/60 dark:text-[#9ca3af] dark:hover:text-[#f3f4f6] dark:hover:bg-[#272a34]/60',
    cinnabar:
      'bg-[#b83b3b] text-white hover:bg-[#9c2e2e] shadow-sm hover:shadow-md hover:shadow-red-900/20 hover:-translate-y-0.5 focus:ring-[#b83b3b]',
  };

  const innerContent = (
    <>
      {/* Subtle ink wash spread ripple background on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
      />
      {icon && iconPosition === 'left' && <span className="transition-transform group-hover:scale-110">{icon}</span>}
      <span className="relative z-10">{children}</span>
      {icon && iconPosition === 'right' && <span className="transition-transform group-hover:translate-x-0.5">{icon}</span>}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      disabled={disabled}
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      {...props}
    >
      {innerContent}
    </button>
  );
}

export default InkButton;
