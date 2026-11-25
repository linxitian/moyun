'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '确认删除',
  cancelText = '取消',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#e6e2d8] dark:bg-[#1a1c22] dark:border-[#2d313c] transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isDestructive
                  ? 'bg-[#b83b3b]/10 text-[#b83b3b] dark:bg-[#b83b3b]/20 dark:text-[#f87171]'
                  : 'bg-[#2d3a4b]/10 text-[#2d3a4b] dark:bg-[#393e4f] dark:text-[#9ca3af]'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#1a1c23] dark:text-[#f3f4f6]">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1.5 text-[#6b7280] hover:bg-[#f0ece1] dark:hover:bg-[#22252e] dark:text-[#9ca3af] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm text-[#4f566b] dark:text-[#9ca3af] leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm border border-[#d1d5db] dark:border-[#393e4f]"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-lg px-4 py-2 text-sm text-white transition-colors ${
              isDestructive
                ? 'bg-[#b83b3b] hover:bg-[#9c2e2e] dark:bg-[#b83b3b] dark:hover:bg-[#9c2e2e]'
                : 'bg-[#1a1c23] hover:bg-[#272a34] dark:bg-[#f3f4f6] dark:text-[#1a1c23]'
            }`}
          >
            {isLoading ? '处理中...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
