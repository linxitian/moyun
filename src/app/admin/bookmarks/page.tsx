'use client';

import React, { useState } from 'react';
import { useAdminData } from '@/components/admin/useAdminData';
import Link from 'next/link';
import { PlusCircle, Search, ExternalLink, Edit2, Trash2, Folder, FolderPlus, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { deleteBookmarkAction, deleteBookmarkCategoryAction, createBookmarkCategoryAction } from '@/lib/actions/bookmarks';

interface BookmarkItem {
  id: number;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  categoryId: number | null;
  sortOrder: number | null;
  createdAt: string;
}

interface CategoryGroup {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sortOrder: number | null;
  bookmarks: BookmarkItem[];
}

export default function AdminBookmarksPage() {
  const { data: categoriesWithBookmarks, setData: setCategoriesWithBookmarks, loading, error: loadError, reload } = useAdminData<CategoryGroup[]>('/api/bookmarks', 'categories', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<BookmarkItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Category deletion state
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<CategoryGroup | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  // New category modal/input state
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const handleDeleteBookmark = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteBookmarkAction(deleteTarget.id);
      if (res.error) {
        alert(res.error);
      } else {
        setCategoriesWithBookmarks((prev) =>
          prev.map((cat) => ({
            ...cat,
            bookmarks: cat.bookmarks.filter((b) => b.id !== deleteTarget.id),
          }))
        );
        setDeleteTarget(null);
      }
    } catch {
      alert('删除失败，请稍后重试');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryTarget) return;
    setIsDeletingCategory(true);
    try {
      const res = await deleteBookmarkCategoryAction(deleteCategoryTarget.id);
      if (res.error) {
        alert(res.error);
      } else {
        setCategoriesWithBookmarks((prev) =>
          prev.filter((c) => c.id !== deleteCategoryTarget.id)
        );
        setDeleteCategoryTarget(null);
      }
    } catch {
      alert('删除分类失败');
    } finally {
      setIsDeletingCategory(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const res = await createBookmarkCategoryAction({ name: newCatName.trim() });
      if (res.category) {
        setCategoriesWithBookmarks((prev) => [
          ...prev,
          {
            ...res.category!,
            bookmarks: [],
          },
        ]);
        setNewCatName('');
        setShowNewCatInput(false);
      } else {
        alert(res.error || '创建分类失败');
      }
    } catch {
      alert('创建分类出错');
    } finally {
      setCreatingCat(false);
    }
  };

  // Filter bookmarks
  const totalCount = categoriesWithBookmarks.reduce(
    (acc, cat) => acc + cat.bookmarks.length,
    0
  );

  const filteredCategories = categoriesWithBookmarks
    .filter((cat) => selectedCategory === 'all' || String(cat.id) === selectedCategory)
    .map((cat) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return cat;

      const filtered = cat.bookmarks.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q)
      );

      return {
        ...cat,
        bookmarks: filtered,
      };
    })
    .filter((cat) => cat.bookmarks.length > 0 || !searchQuery.trim());

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {(loadError) && <div role="alert" className="rounded-xl border border-red-300 p-4 text-sm text-red-700">{loadError} <button type="button" onClick={reload} className="underline">重新加载</button></div>}
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e2d8] pb-5 dark:border-[#2d313c]">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1a1c23] dark:text-[#f3f4f6]">
            网址导航管理
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af]">
            共收录 {totalCount} 个优质站点，按分类精心规整。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowNewCatInput(!showNewCatInput)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#d1d5db] bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-[#1a1c23] hover:bg-[#faf8f5] dark:border-[#393e4f] dark:bg-[#1a1c22] dark:text-[#f3f4f6] dark:hover:bg-[#22252e] transition-colors"
          >
            <FolderPlus className="h-4 w-4" />
            <span>新建分类</span>
          </button>
          <Link
            href="/admin/bookmarks/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a1c23] px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-[#272a34] dark:bg-[#f3f4f6] dark:text-[#121316] dark:hover:bg-[#e5e7eb] transition-all"
          >
            <PlusCircle className="h-4 w-4 text-[#b83b3b]" />
            <span>添加导航书签</span>
          </Link>
        </div>
      </div>

      {/* Inline Create Category Bar */}
      {showNewCatInput && (
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-white dark:bg-[#1a1c22] rounded-2xl border border-[#e6e2d8] dark:border-[#2d313c] shadow-xs">
          <Folder className="h-5 w-5 text-[#b83b3b] shrink-0" />
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="请输入新导航分类名称 (如：开发工具、设计灵感、AI工具)"
            className="flex-1 rounded-xl border border-[#d1d5db] bg-transparent py-1.5 px-3 text-xs sm:text-sm focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
          />
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowNewCatInput(false)}
              className="text-xs text-[#6b7280] hover:underline px-2"
            >
              取消
            </button>
            <button
              type="button"
              disabled={creatingCat || !newCatName.trim()}
              onClick={handleCreateCategory}
              className="rounded-xl bg-[#1a1c23] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#272a34] dark:bg-[#f3f4f6] dark:text-[#121316] disabled:opacity-50"
            >
              {creatingCat ? '创建中...' : '确认创建'}
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#e6e2d8] shadow-xs dark:bg-[#1a1c22] dark:border-[#2d313c]">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索网站名称、链接或描述..."
            className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-1.5 pl-9 pr-3 text-xs sm:text-sm placeholder-[#9ca3af] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-[#d1d5db] bg-transparent py-1.5 px-3 text-xs sm:text-sm text-[#4f566b] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#9ca3af] dark:bg-[#1a1c22]"
        >
          <option value="all">所有分类 ({totalCount})</option>
          {categoriesWithBookmarks.map((cat) => (
            <option key={cat.id} value={String(cat.id)}>
              {cat.name} ({cat.bookmarks.length})
            </option>
          ))}
        </select>
      </div>

      {/* Bookmarks Grouped by Category */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#6b7280] dark:text-[#9ca3af]">
          <Loader2 className="h-6 w-6 animate-spin text-[#b83b3b]" />
          <span className="text-xs">加载导航数据中...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#6b7280] dark:text-[#9ca3af]">
          暂无匹配的导航书签
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((cat) => (
            <Card
              key={cat.id}
              className="rounded-2xl border border-[#e6e2d8] shadow-xs overflow-hidden dark:border-[#2d313c] dark:bg-[#1a1c22]"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-[#e6e2d8] bg-[#faf8f5]/80 px-6 py-3.5 dark:border-[#2d313c] dark:bg-[#16181f]/80">
                <div className="flex items-center gap-2.5">
                  <Folder className="h-4 w-4 text-[#b83b3b]" />
                  <h3 className="font-serif font-bold text-sm text-[#1a1c23] dark:text-[#f3f4f6]">
                    {cat.name}
                  </h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {cat.bookmarks.length} 个站点
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/bookmarks/new`}
                    className="text-xs text-[#b83b3b] hover:underline"
                  >
                    + 添加到本分类
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteCategoryTarget(cat)}
                    title="删除分类"
                    className="p-1 text-[#9ca3af] hover:text-[#b83b3b] transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Category Bookmarks Table */}
              {cat.bookmarks.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#9ca3af]">
                  该分类下暂无书签，点击上方“添加到本分类”快速添加
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#e6e2d8]/60 text-[11px] font-semibold text-[#6b7280] dark:border-[#2d313c]/60 dark:text-[#9ca3af]">
                        <th className="py-3 pl-6 pr-3">站点名称</th>
                        <th className="py-3 px-3">链接地址</th>
                        <th className="py-3 px-3">描述说明</th>
                        <th className="py-3 px-3">排序权重</th>
                        <th className="py-3 pl-3 pr-6 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e6e2d8]/40 dark:divide-[#2d313c]/40">
                      {cat.bookmarks.map((bm) => (
                        <tr
                          key={bm.id}
                          className="hover:bg-[#faf8f5] dark:hover:bg-[#22252e]/50 transition-colors"
                        >
                          <td className="py-3.5 pl-6 pr-3 font-medium text-sm">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1a1c23]/5 text-[#1a1c23] dark:bg-[#f3f4f6]/10 dark:text-[#f3f4f6] text-xs shrink-0 font-mono">
                                {bm.icon ? bm.icon.slice(0, 2) : '网'}
                              </span>
                              <span className="text-[#1a1c23] dark:text-[#f3f4f6] font-semibold">
                                {bm.title}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-mono text-xs text-[#6b7280] dark:text-[#9ca3af] max-w-[200px] truncate">
                            {bm.url}
                          </td>

                          <td className="py-3.5 px-3 text-xs text-[#6b7280] dark:text-[#9ca3af] max-w-xs truncate">
                            {bm.description || '-'}
                          </td>

                          <td className="py-3.5 px-3 font-mono text-xs text-[#6b7280] dark:text-[#9ca3af]">
                            {bm.sortOrder ?? 0}
                          </td>

                          <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={bm.url}
                                target="_blank"
                                rel="noreferrer"
                                title="直接访问"
                                className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#1a1c23] hover:bg-[#e6e2d8] dark:text-[#9ca3af] dark:hover:text-white dark:hover:bg-[#22252e] transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                              <Link
                                href={`/admin/bookmarks/${bm.id}/edit`}
                                title="编辑书签"
                                className="p-1.5 rounded-lg text-[#1a1c23] hover:bg-[#e6e2d8] dark:text-[#f3f4f6] dark:hover:bg-[#22252e] transition-colors"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(bm)}
                                title="删除书签"
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
          ))}
        </div>
      )}

      {/* Delete Bookmark Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="确认删除该导航书签"
        message={`您确定要彻底删除书签 "${deleteTarget?.title}" 吗？此操作无法撤销。`}
        confirmText="确认彻底删除"
        isLoading={isDeleting}
        onConfirm={handleDeleteBookmark}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Delete Category Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteCategoryTarget}
        title="确认删除导航分类"
        message={`您确定要删除分类 "${deleteCategoryTarget?.name}" 吗？分类下的书签将变为未分类状态。`}
        confirmText="确认删除分类"
        isLoading={isDeletingCategory}
        onConfirm={handleDeleteCategory}
        onClose={() => setDeleteCategoryTarget(null)}
      />
    </div>
  );
}
