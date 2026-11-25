'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, UploadCloud, FileCheck, AlertCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatFileSize } from '@/lib/utils';
import { createDownloadAction } from '@/lib/actions/downloads';

export default function NewDownloadPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('开发工具');
  const [customCategory, setCustomCategory] = useState('');
  const [fileName, setFileName] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileType, setFileType] = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        throw new Error(data.error || '文件上传失败');
      }

      setFilePath(data.url);
      setFileName(data.fileName);
      setFileSize(data.fileSize);
      setFileType(data.fileType);

      // Auto-set title if empty
      if (!title.trim()) {
        const cleanName = data.fileName.replace(/\.[^/.]+$/, '');
        setTitle(cleanName);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '文件上传出错，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('请输入资源标题');
      return;
    }
    if (!filePath.trim() || !fileName.trim()) {
      setError('请先上传资源文件');
      return;
    }

    setSaving(true);

    const resolvedCategory =
      category === '自定义' ? customCategory.trim() || '其他资源' : category;

    try {
      const res = await createDownloadAction({
        title: title.trim(),
        description: description.trim() || undefined,
        fileName: fileName.trim(),
        filePath: filePath.trim(),
        fileSize,
        fileType: fileType.trim() || undefined,
        category: resolvedCategory,
      });

      if (res.error) {
        setError(res.error);
      } else {
        router.push('/admin/downloads');
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '创建下载记录失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e2d8] pb-5 dark:border-[#2d313c]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/downloads"
            className="rounded-xl border border-[#d1d5db] p-2 text-[#4f566b] hover:bg-[#e6e2d8] hover:text-[#1a1c23] dark:border-[#393e4f] dark:text-[#9ca3af] dark:hover:bg-[#22252e] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1a1c23] dark:text-[#f3f4f6]">
              上传新资源
            </h1>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
              将开源工具包、手册与水墨资源上传至服务器并托管
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving || uploading}
          className="rounded-xl bg-[#1a1c23] px-5 py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-[#272a34] dark:bg-[#f3f4f6] dark:text-[#121316] dark:hover:bg-[#e5e7eb] transition-all self-start sm:self-auto"
        >
          {saving ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-4 w-4 animate-spin text-[#b83b3b]" />
              <span>保存中...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Save className="h-4 w-4" />
              <span>保存并发布</span>
            </span>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-[#b83b3b]/10 p-3.5 text-xs text-[#b83b3b] dark:bg-[#b83b3b]/20 dark:text-[#f87171] border border-[#b83b3b]/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Card */}
      <Card className="rounded-2xl border border-[#e6e2d8] p-6 shadow-xs dark:border-[#2d313c] dark:bg-[#1a1c22] space-y-5">
        {/* File Upload Box */}
        <div>
          <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-2">
            选择文件上传 <span className="text-[#b83b3b]">*</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="resource-file-upload"
          />

          {!filePath ? (
            <label
              htmlFor="resource-file-upload"
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d1d5db] bg-[#faf8f5]/50 p-8 text-center cursor-pointer hover:border-[#1a1c23] hover:bg-[#faf8f5] dark:border-[#393e4f] dark:bg-[#121316]/50 dark:hover:border-[#f3f4f6] dark:hover:bg-[#121316] transition-all ${
                uploading ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-[#b83b3b] mb-3" />
                  <p className="text-sm font-medium text-[#1a1c23] dark:text-[#f3f4f6]">
                    正在上传文件到服务器，请稍候...
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a1c23]/5 text-[#1a1c23] dark:bg-[#f3f4f6]/10 dark:text-[#f3f4f6]">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-serif font-bold text-[#1a1c23] dark:text-[#f3f4f6]">
                    点击或拖拽文件至此区域上传
                  </p>
                  <p className="mt-1 text-xs text-[#6b7280] dark:text-[#9ca3af]">
                    支持 ZIP, PDF, 源码包, 图像等各类常用文件格式，单个文件建议小于 50MB
                  </p>
                </>
              )}
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 dark:border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#1a1c23] dark:text-[#f3f4f6]">
                    {fileName}
                  </div>
                  <div className="text-xs text-[#6b7280] dark:text-[#9ca3af] font-mono">
                    大小: {formatFileSize(fileSize)} · 路径: {filePath}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFilePath('');
                  setFileName('');
                  setFileSize(0);
                }}
                className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#b83b3b] hover:bg-[#b83b3b]/10 transition-colors"
                title="重新选择文件"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Title and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
              资源显示标题 <span className="text-[#b83b3b]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：墨韵主题源码包 v1.0"
              className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-sm text-[#1a1c23] placeholder-[#9ca3af] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
              资源分类
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-sm text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6] dark:bg-[#1a1c22]"
            >
              <option value="代码程序">代码程序 (Code / Scripts)</option>
              <option value="文档资料">文档资料 (Docs / PDFs)</option>
              <option value="开发工具">开发工具 (Tools)</option>
              <option value="水墨壁纸">水墨壁纸 (Wallpapers / Assets)</option>
              <option value="自定义">自定义分类...</option>
            </select>

            {category === '自定义' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="请输入自定义分类名"
                className="mt-2 w-full rounded-xl border border-[#d1d5db] bg-transparent py-1.5 px-3 text-xs sm:text-sm text-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
              />
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
            资源简介与使用说明
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简要说明此文件的内容、适用环境、安装或解压方式等..."
            className="w-full rounded-xl border border-[#d1d5db] bg-transparent p-3 text-sm text-[#1a1c23] placeholder-[#9ca3af] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
          />
        </div>
      </Card>
    </form>
  );
}
