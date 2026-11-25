'use client';

import React, { useState } from 'react';
import { useAdminData } from '@/components/admin/useAdminData';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Search, Edit2, Trash2, ExternalLink, ChevronLeft, ChevronRight, Loader2, Folder } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { deletePostAction } from '@/lib/actions/posts';

interface PostItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  categoryId: number | null;
  categoryName: string | null;
  status: string;
  pinned: boolean | null;
  viewCount: number | null;
  createdAt: string;
  tags?: { id: number; name: string }[];
}

export default function AdminPostsPage() {
  const { data: postsList, setData: setPostsList, loading, error: loadError, reload } = useAdminData<PostItem[]>('/api/posts?status=all&limit=200', 'posts', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { data: categories, error: categoryError, reload: reloadCategories } = useAdminData<{ id: number; name: string }[]>('/api/categories', 'categories', []);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<PostItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deletePostAction(deleteTarget.id);
      if (res.error) {
        alert(res.error);
      } else {
        setPostsList((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch {
      alert('删除失败，请稍后重试');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter posts
  const filteredPosts = postsList.filter((post) => {
    if (statusFilter !== 'all' && post.status !== statusFilter) {
      return false;
    }
    if (categoryFilter !== 'all' && String(post.categoryId) !== categoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchSlug = post.slug.toLowerCase().includes(q);
      const matchExcerpt = post.excerpt?.toLowerCase().includes(q);
      if (!matchTitle && !matchSlug && !matchExcerpt) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filteredPosts.length / pageSize) || 1;
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {(loadError || categoryError) && <div role="alert" className="rounded-xl border border-red-300 p-4 text-sm text-red-700">{loadError || categoryError} <button type="button" onClick={() => { reload(); reloadCategories(); }} className="underline">重新加载</button></div>}
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e2d8] pb-5 dark:border-[#2d313c]">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1a1c23] dark:text-[#f3f4f6]">
            文章管理
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af]">
            共计 {postsList.length} 篇博文，包括随笔、架构探讨与生活感悟。
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a1c23] px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-[#272a34] dark:bg-[#f3f4f6] dark:text-[#121316] dark:hover:bg-[#e5e7eb] transition-all self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4 text-[#b83b3b]" />
          <span>撰写新博文</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#e6e2d8] shadow-xs dark:bg-[#1a1c22] dark:border-[#2d313c]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="搜索文章标题、别名或摘要..."
            className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-1.5 pl-9 pr-3 text-xs sm:text-sm placeholder-[#9ca3af] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status tabs */}
          <div className="flex items-center rounded-xl bg-[#faf8f5] p-1 border border-[#e6e2d8] dark:bg-[#121316] dark:border-[#2d313c]">
            <button
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-[#1a1c23] shadow-xs dark:bg-[#22252e] dark:text-white'
                  : 'text-[#6b7280] dark:text-[#9ca3af]'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => {
                setStatusFilter('published');
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === 'published'
                  ? 'bg-white text-[#1a1c23] shadow-xs dark:bg-[#22252e] dark:text-white'
                  : 'text-[#6b7280] dark:text-[#9ca3af]'
              }`}
            >
              已发布
            </button>
            <button
              onClick={() => {
                setStatusFilter('draft');
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-white text-[#1a1c23] shadow-xs dark:bg-[#22252e] dark:text-white'
                  : 'text-[#6b7280] dark:text-[#9ca3af]'
              }`}
            >
              草稿
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-[#d1d5db] bg-transparent py-1.5 px-3 text-xs sm:text-sm text-[#4f566b] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#9ca3af] dark:bg-[#1a1c22]"
          >
            <option value="all">所有分类</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <Card className="rounded-2xl border border-[#e6e2d8] shadow-xs overflow-hidden dark:border-[#2d313c] dark:bg-[#1a1c22]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#6b7280] dark:text-[#9ca3af]">
            <Loader2 className="h-6 w-6 animate-spin text-[#b83b3b]" />
            <span className="text-xs">加载文章列表中...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#6b7280] dark:text-[#9ca3af]">
            未找到匹配的文章记录
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e6e2d8] bg-[#faf8f5]/60 text-xs font-semibold text-[#6b7280] dark:border-[#2d313c] dark:bg-[#16181f]/60 dark:text-[#9ca3af]">
                  <th className="py-3.5 pl-6 pr-3">文章标题</th>
                  <th className="py-3.5 px-3">分类</th>
                  <th className="py-3.5 px-3">标签</th>
                  <th className="py-3.5 px-3">状态</th>
                  <th className="py-3.5 px-3">浏览</th>
                  <th className="py-3.5 px-3">创建时间</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e2d8]/60 dark:divide-[#2d313c]/60">
                {paginatedPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-[#faf8f5] dark:hover:bg-[#22252e]/50 transition-colors"
                  >
                    <td className="py-4 pl-6 pr-3 font-medium">
                      <div className="flex items-center gap-3">
                        {post.coverImage && (
                          <Image
                            width={56}
                            height={40}
                            unoptimized
                            src={post.coverImage}
                            alt=""
                            className="h-10 w-14 rounded-md object-cover border border-[#e6e2d8] dark:border-[#2d313c] shrink-0"
                          />
                        )}
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <div className="flex items-center gap-1.5">
                            {post.pinned && (
                              <span className="rounded bg-[#b83b3b]/10 px-1.5 py-0.2 text-[10px] font-bold text-[#b83b3b] shrink-0">
                                置顶
                              </span>
                            )}
                            <Link
                              href={`/admin/posts/${post.id}/edit`}
                              className="font-serif font-bold text-[#1a1c23] hover:text-[#b83b3b] dark:text-[#f3f4f6] dark:hover:text-[#d24e4e] truncate block text-sm"
                            >
                              {post.title}
                            </Link>
                          </div>
                          <span className="text-[11px] font-mono text-[#9ca3af] block truncate">
                            /{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-xs text-[#4f566b] dark:text-[#9ca3af] whitespace-nowrap">
                      {post.categoryName ? (
                        <span className="inline-flex items-center gap-1">
                          <Folder className="h-3 w-3 text-[#b83b3b]" />
                          <span>{post.categoryName}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">无</span>
                      )}
                    </td>

                    <td className="py-4 px-3 text-xs whitespace-nowrap">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {post.tags && post.tags.length > 0 ? (
                          post.tags.map((t) => (
                            <span
                              key={t.id}
                              className="rounded bg-[#f0ece1] px-1.5 py-0.5 text-[10px] text-[#4f566b] dark:bg-[#22252e] dark:text-[#9ca3af]"
                            >
                              {t.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-[11px]">-</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-3 whitespace-nowrap">
                      <Badge
                        variant={post.status === 'published' ? 'default' : 'secondary'}
                        className="text-[11px]"
                      >
                        {post.status === 'published' ? '已发布' : '草稿'}
                      </Badge>
                    </td>

                    <td className="py-4 px-3 text-xs text-[#6b7280] dark:text-[#9ca3af] whitespace-nowrap">
                      {post.viewCount || 0}
                    </td>

                    <td className="py-4 px-3 text-xs text-[#6b7280] dark:text-[#9ca3af] whitespace-nowrap">
                      {formatDate(post.createdAt)}
                    </td>

                    <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          title="在网站前台查看"
                          className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#1a1c23] hover:bg-[#e6e2d8] dark:text-[#9ca3af] dark:hover:text-white dark:hover:bg-[#22252e] transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          title="编辑文章"
                          className="p-1.5 rounded-lg text-[#1a1c23] hover:bg-[#e6e2d8] dark:text-[#f3f4f6] dark:hover:bg-[#22252e] transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(post)}
                          title="删除文章"
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

        {/* Pagination Footer */}
        {filteredPosts.length > pageSize && (
          <div className="flex items-center justify-between border-t border-[#e6e2d8] px-6 py-3.5 text-xs text-[#6b7280] dark:border-[#2d313c] dark:text-[#9ca3af]">
            <div>
              显示第 {(currentPage - 1) * pageSize + 1} 至{' '}
              {Math.min(currentPage * pageSize, filteredPosts.length)} 项，共{' '}
              {filteredPosts.length} 篇
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[#d1d5db] hover:bg-[#e6e2d8] disabled:opacity-40 disabled:pointer-events-none dark:border-[#393e4f] dark:hover:bg-[#22252e]"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[#d1d5db] hover:bg-[#e6e2d8] disabled:opacity-40 disabled:pointer-events-none dark:border-[#393e4f] dark:hover:bg-[#22252e]"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="确认删除此博文"
        message={`您确定要彻底删除文章 "${deleteTarget?.title}" 吗？此操作无法撤销。`}
        confirmText="确认彻底删除"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
