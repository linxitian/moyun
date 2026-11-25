import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface TagBadgeProps {
  name: string;
  slug?: string;
  href?: string;
  active?: boolean;
  count?: number;
  variant?: 'default' | 'cinnabar' | 'indigo' | 'bamboo' | 'ochre';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

export function TagBadge({
  name,
  href,
  active = false,
  count,
  variant = 'default',
  size = 'sm',
  className,
  onClick,
}: TagBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3.5 py-1',
  };

  const variantClasses = {
    default: active
      ? 'bg-[#1a1c23] text-white dark:bg-[#f3f4f6] dark:text-[#121316]'
      : 'bg-[#f0ece1]/80 text-[#4f566b] hover:bg-[#e6e2d8] hover:text-[#1a1c23] dark:bg-[#22252e] dark:text-[#9ca3af] dark:hover:bg-[#2d313c] dark:hover:text-[#f3f4f6]',
    cinnabar: active
      ? 'bg-[#b83b3b] text-white'
      : 'bg-[#b83b3b]/10 text-[#b83b3b] hover:bg-[#b83b3b]/20 dark:bg-[#b83b3b]/20 dark:text-[#e57373]',
    indigo: active
      ? 'bg-[#2d3a4b] text-white'
      : 'bg-[#2d3a4b]/10 text-[#2d3a4b] hover:bg-[#2d3a4b]/20 dark:bg-[#2d3a4b]/30 dark:text-[#90caf9]',
    bamboo: active
      ? 'bg-[#4a6b5d] text-white'
      : 'bg-[#4a6b5d]/10 text-[#4a6b5d] hover:bg-[#4a6b5d]/20 dark:bg-[#4a6b5d]/30 dark:text-[#a5d6a7]',
    ochre: active
      ? 'bg-[#9a6850] text-white'
      : 'bg-[#9a6850]/10 text-[#9a6850] hover:bg-[#9a6850]/20 dark:bg-[#9a6850]/30 dark:text-[#ffcc80]',
  };

  const content = (
    <>
      <span className="font-serif">#{name}</span>
      {typeof count === 'number' && (
        <span className="ml-1 text-[10px] opacity-70">({count})</span>
      )}
    </>
  );

  const combinedClasses = cn(
    'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 select-none cursor-pointer',
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  return (
    <span onClick={onClick} className={combinedClasses} role={onClick ? 'button' : undefined}>
      {content}
    </span>
  );
}

export default TagBadge;
