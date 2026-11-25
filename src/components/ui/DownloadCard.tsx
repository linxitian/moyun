'use client';

import React from 'react';
import {
  FileText,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileImage,
  Download,
  HardDrive,
} from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';
import { PaperCard } from './PaperCard';
import { InkButton } from './InkButton';

export interface DownloadCardProps {
  id?: number;
  title: string;
  description?: string | null;
  fileName: string;
  filePath: string;
  fileSize?: number | null;
  fileType?: string | null;
  category?: string | null;
  downloadCount?: number | null;
  createdAt?: string | Date;
  className?: string;
  available?: boolean;
}

function renderFileIcon(type?: string | null, name?: string) {
  const ext = name?.split('.').pop()?.toLowerCase();
  const mime = type?.toLowerCase() || '';

  if (ext === 'zip' || ext === 'rar' || ext === '7z' || ext === 'tar' || mime.includes('zip')) {
    return <FileArchive className="w-5 h-5" />;
  }
  if (ext === 'pdf' || mime.includes('pdf')) {
    return <FileText className="w-5 h-5" />;
  }
  if (['ts', 'tsx', 'js', 'json', 'py', 'html', 'css'].includes(ext || '')) {
    return <FileCode className="w-5 h-5" />;
  }
  if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext || '') || mime.includes('image')) {
    return <FileImage className="w-5 h-5" />;
  }
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
    return <FileSpreadsheet className="w-5 h-5" />;
  }
  return <HardDrive className="w-5 h-5" />;
}

export function DownloadCard({
  id,
  title,
  description,
  fileName,
  filePath,
  fileSize = 0,
  fileType,
  category,
  downloadCount = 0,
  className,
  available = true,
}: DownloadCardProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = id ? `/api/downloads/${id}/file` : filePath;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PaperCard
      hoverEffect={true}
      className={cn('p-6 flex flex-col justify-between h-full transition-all', className)}
    >
      <div>
        {/* Top metadata badge & file extension */}
        <div className="flex items-center justify-between gap-2 mb-4">
          {category && (
            <span className="text-xs font-serif font-medium text-[#2d3a4b] dark:text-[#90caf9] bg-[#2d3a4b]/10 dark:bg-[#2d3a4b]/20 px-2.5 py-0.5 rounded-full">
              {category}
            </span>
          )}
          <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-[#f0ece1] dark:bg-[#22252e] text-[#6b7280] dark:text-[#9ca3af]">
            {fileName.split('.').pop() || 'FILE'}
          </span>
        </div>

        {/* Title with Icon */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="p-2.5 rounded-lg bg-[#b83b3b]/10 dark:bg-[#b83b3b]/20 text-[#b83b3b] dark:text-[#d24e4e] flex-shrink-0">
            {renderFileIcon(fileType, fileName)}
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1a1c23] dark:text-[#f3f4f6] leading-snug">
              {title}
            </h3>
            <p className="text-xs font-mono text-[#6b7280] dark:text-[#9ca3af] mt-0.5 truncate max-w-[240px]">
              {fileName}
            </p>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-[#4f566b] dark:text-[#9ca3af] line-clamp-2 leading-relaxed mb-4">
            {description}
          </p>
        )}
      </div>

      {/* Footer stats & Download CTA */}
      <div className="pt-4 border-t border-[#e6e2d8]/60 dark:border-[#2d313c]/60 flex items-center justify-between gap-2">
        <div className="flex flex-col text-xs text-[#6b7280] dark:text-[#9ca3af]">
          <span className="font-mono">{formatFileSize(fileSize || 0)}</span>
          <span className="text-[11px] opacity-80">已下载 {downloadCount || 0} 次</span>
        </div>

        <InkButton
          variant="secondary"
          size="sm"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={handleDownload}
          disabled={!available}
        >
          {available ? '立即下载' : '文件待上传'}
        </InkButton>
      </div>
    </PaperCard>
  );
}

export default DownloadCard;
