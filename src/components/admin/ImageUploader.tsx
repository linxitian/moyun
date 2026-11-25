'use client';

import Image from 'next/image';

import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  accept?: string;
  helperText?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = '封面图片',
  placeholder = '/uploads/cover.jpg 或图片在线链接',
  accept = 'image/*',
  helperText = '支持 JPG, PNG, WebP, SVG 格式',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '上传失败');
      }

      onChange(data.url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '上传出现错误，请重试';
      setError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#4f566b] dark:text-[#9ca3af]">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-[#b83b3b] hover:underline"
          >
            清除图片
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start">
        {/* URL Input */}
        <div className="flex-1 w-full relative">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-[#d1d5db] bg-white px-3.5 py-2 text-sm text-[#1a1c23] placeholder-[#9ca3af] focus:border-[#1a1c23] focus:outline-none focus:ring-1 focus:ring-[#1a1c23] dark:border-[#393e4f] dark:bg-[#1a1c22] dark:text-[#f3f4f6] dark:focus:border-[#f3f4f6] dark:focus:ring-[#f3f4f6]"
          />
        </div>

        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`upload-${label}`}
          />
          <label
            htmlFor={`upload-${label}`}
            className={`inline-flex items-center gap-1.5 cursor-pointer rounded-lg border border-[#d1d5db] bg-[#faf8f5] px-4 py-2 text-sm font-medium text-[#1a1c23] hover:bg-[#f0ece1] dark:border-[#393e4f] dark:bg-[#22252e] dark:text-[#f3f4f6] dark:hover:bg-[#2d313c] transition-colors ${
              uploading ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#b83b3b]" />
                <span>上传中...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                <span>本地上传</span>
              </>
            )}
          </label>
        </div>
      </div>

      {error && (
        <p className="text-xs text-[#b83b3b] dark:text-[#f87171]">{error}</p>
      )}

      {/* Image Preview */}
      {value && (
        <div className="relative mt-2 inline-block rounded-xl border border-[#e6e2d8] bg-[#f5f2eb] p-2 dark:border-[#2d313c] dark:bg-[#1a1c22]">
          <Image
            width={320}
            height={160}
            unoptimized
            src={value}
            alt="Preview"
            className="max-h-40 rounded-lg object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="block mt-1 font-mono text-[10px] text-[#6b7280] dark:text-[#9ca3af] truncate max-w-xs">
            {value}
          </span>
        </div>
      )}

      <p className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">
        {helperText}
      </p>
    </div>
  );
}
