'use client';

import React, { useState } from 'react';
import { useAdminData } from '@/components/admin/useAdminData';
import Link from 'next/link';
import { Download, PlusCircle, Search, FileCode, FileText, FileArchive, Trash2, ExternalLink, Loader2, Folder, Copy, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';

import { formatDate, formatFileSize } from '@/lib/utils';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { deleteDownloadAction } from '@/lib/actions/downloads';

interface DownloadItem {
  id: number;
  title: string;
  description: string | null;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  fileType: string | null;
  category: string | null;
  downloadCount: number | null;
  createdAt: string;
}

export default function AdminDownloadsPage() {
  const { data: downloadsList, setData: setDownloadsList, loading, error: loadError, reload } = useAdminData<DownloadItem[]>('/api/downloads', 'downloads', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<DownloadItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteDownloadAction(deleteTarget.id);
      if (res.error) {
        alert(res.error);
      } else {
        setDownloadsList((prev) => prev.filter((d) => d.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch {
      alert('删除失败，请稍后重试');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyDownloadLink = (item: DownloadItem) => {
    const fullUrl = `${window.location.origin}/api/downloads/${item.id}/file`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = Array.from(
    new Set(downloadsList.map((d) => d.category).filter(Boolean))
  ) as string[];

  const filteredDownloads = downloadsList.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchFile = item.fileName.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchFile && !matchDesc) {
        return false;
      }
    }
    return true;
  });

  const getFileIcon = (fileType?: string | null, fileName?: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'zip' || ext === 'tar' || ext === 'gz' || ext === '7z') {
      return <FileArchive className="h-5 w-5 text-[#9a6850]" />;
    }
    if (ext === 'js' || ext === 'ts' || ext === 'json' || ext === 'py' || ext === 'css') {
      return <FileCode className="h-5 w-5 text-[#2d3a4b] dark:text-[#93c5fd]" />;
    }
    return <FileText className="h-5 w-5 text-[#4a6b5d] dark:text-[#86efac]" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {(loadError) && <div role="alert" className="rounded-xl border border-red-300 p-4 text-sm text-red-700">{loadError} <button type="button" onClick={reload} className="underline">重新加载</button></div>}
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e2d8] pb-5 dark:border-[#2d313c]">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1a1c23] dark:text-[#f3f4f6]">
            资源下载管理
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af]">
            共托管 {downloadsList.length} 项典藏资源，供访客下载参阅。
          </p>
        </div>

        <Link
          href="/admin/downloads/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a1c23] px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-[#272a34] dark:bg-[#f3f4f6] dark:text-[#121316] dark:hover:bg-[#e5e7eb] transition-all"
        >
          <PlusCircle className="h-4 w-4 text-[#b83b3b]" />
          <span>上传新资源</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#e6e2d8] shadow-xs dark:bg-[#1a1c22] dark:border-[#2d313c]">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索资源标题、文件名或描述..."
            className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-1.5 pl-9 pr-3 text-xs sm:text-sm placeholder-[#9ca3af] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-[#d1d5db] bg-transparent py-1.5 px-3 text-xs sm:text-sm text-[#4f566b] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#9ca3af] dark:bg-[#1a1c22]"
        >
          <option value="all">所有分类 ({downloadsList.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Downloads Table */}
      <Card className="rounded-2xl border border-[#e6e2d8] shadow-xs overflow-hidden dark:border-[#2d313c] dark:bg-[#1a1c22]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#6b7280] dark:text-[#9ca3af]">
            <Loader2 className="h-6 w-6 animate-spin text-[#b83b3b]" />
            <span className="text-xs">加载资源数据中...</span>
          </div>
        ) : filteredDownloads.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#6b7280] dark:text-[#9ca3af]">
            未找到匹配的资源文件
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e6e2d8] bg-[#faf8f5]/60 text-xs font-semibold text-[#6b7280] dark:border-[#2d313c] dark:bg-[#16181f]/60 dark:text-[#9ca3af]">
                  <th className="py-3.5 pl-6 pr-3">资源名称</th>
                  <th className="py-3.5 px-3">分类</th>
                  <th className="py-3.5 px-3">文件大小</th>
                  <th className="py-3.5 px-3">下载次数</th>
                  <th className="py-3.5 px-3">上传时间</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e2d8]/60 dark:divide-[#2d313c]/60">
                {filteredDownloads.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#faf8f5] dark:hover:bg-[#22252e]/50 transition-colors"
                  >
                    <td className="py-4 pl-6 pr-3 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faf8f5] border border-[#e6e2d8] dark:bg-[#121316] dark:border-[#2d313c]">
                          {getFileIcon(item.fileType, item.fileName)}
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <span className="font-serif font-bold text-[#1a1c23] dark:text-[#f3f4f6] block truncate">
                            {item.title}
                          </span>
                          <span className="text-[11px] font-mono text-[#9ca3af] block truncate">
                            {item.fileName}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-xs text-[#4f566b] dark:text-[#9ca3af] whitespace-nowrap">
                      {item.category ? (
                        <span className="inline-flex items-center gap-1">
                          <Folder className="h-3 w-3 text-[#b83b3b]" />
                          <span>{item.category}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">常规资源</span>
                      )}
                    </td>

                    <td className="py-4 px-3 font-mono text-xs text-[#6b7280] dark:text-[#9ca3af] whitespace-nowrap">
                      {formatFileSize(item.fileSize || 0)}
                    </td>

                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#1a1c23] dark:text-[#f3f4f6]">
                        <Download className="h-3 w-3 text-[#b83b3b]" />
                        <span>{item.downloadCount || 0}</span>
                      </span>
                    </td>

                    <td className="py-4 px-3 text-xs text-[#6b7280] dark:text-[#9ca3af] whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>

                    <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => copyDownloadLink(item)}
                          title="复制下载链接"
                          className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#1a1c23] hover:bg-[#e6e2d8] dark:text-[#9ca3af] dark:hover:text-white dark:hover:bg-[#22252e] transition-colors"
                        >
                          {copiedId === item.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <a
                          href={`/api/downloads/${item.id}`}
                          title="直接下载文件"
                          className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#1a1c23] hover:bg-[#e6e2d8] dark:text-[#9ca3af] dark:hover:text-white dark:hover:bg-[#22252e] transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          title="删除资源"
                          className="p-1.5 rounded-lg text-[#b83b3b] hover:bg-[#b83b3b]/10 dark:text-[#f87171] dark:hover:bg-[#b83b3b]/20 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="确认删除该资源文件"
        message={`您确定要彻底删除资源 "${deleteTarget?.title}" (${deleteTarget?.fileName}) 吗？此操作将移除下载记录。`}
        confirmText="确认彻底删除"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
