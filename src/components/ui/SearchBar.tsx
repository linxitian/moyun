'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  onSearch?: (val: string) => void;
  className?: string;
  autoSubmit?: boolean;
}

export function SearchBar({
  placeholder = '搜索文章、笔记或见解...',
  defaultValue = '',
  value: controlledValue,
  onChange,
  onSearch,
  className,
  autoSubmit = false,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [internalValue, setInternalValue] = useState(
    controlledValue !== undefined ? controlledValue : defaultValue || searchParams?.get('q') || ''
  );

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    if (!isControlled) {
      setInternalValue(nextVal);
    }
    onChange?.(nextVal);
    if (autoSubmit && onSearch) {
      onSearch(nextVal);
    }
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    onChange?.('');
    onSearch?.('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(currentValue);
    } else {
      // Default behavior: navigate with ?q=
      const params = new URLSearchParams(searchParams?.toString() || '');
      if (currentValue.trim()) {
        params.set('q', currentValue.trim());
      } else {
        params.delete('q');
      }
      params.delete('page'); // reset to page 1
      router.push(`?${params.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'relative flex items-center w-full max-w-md group transition-all duration-300',
        className
      )}
    >
      <div className="absolute left-3.5 text-[#6b7280] dark:text-[#9ca3af] pointer-events-none group-focus-within:text-[#b83b3b] dark:group-focus-within:text-[#d24e4e] transition-colors">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#ffffff] dark:bg-[#1a1c22] border border-[#e6e2d8] dark:border-[#2d313c] rounded-xl text-[#1a1c23] dark:text-[#f3f4f6] placeholder-[#9ca3af] dark:placeholder-[#6b7280] shadow-sm transition-all duration-300 focus:outline-none focus:border-[#b83b3b] dark:focus:border-[#d24e4e] focus:ring-2 focus:ring-[#b83b3b]/20"
      />

      {currentValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 rounded-full text-[#9ca3af] hover:text-[#1a1c23] dark:hover:text-[#f3f4f6] hover:bg-[#f0ece1] dark:hover:bg-[#272a34] transition-colors"
          aria-label="清空搜索"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </form>
  );
}

export default SearchBar;
