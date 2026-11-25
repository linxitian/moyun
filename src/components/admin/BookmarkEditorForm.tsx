'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Check,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from './ConfirmDialog';
import {
  createBookmarkAction,
  updateBookmarkAction,
  deleteBookmarkAction,
  createBookmarkCategoryAction,
} from '@/lib/actions/bookmarks';

export interface BookmarkEditorData {
  id?: number;
  title: string;
  url: string;
  description?: string | null;
  icon?: string | null;
  categoryId?: number | null;
  sortOrder?: number | null;
}

interface BookmarkEditorFormProps {
  initialData?: BookmarkEditorData;
  categories: { id: number; name: string }[];
  isEdit?: boolean;
}

export function BookmarkEditorForm({
  initialData,
  categories: initialCategories,
  isEdit = false,
}: BookmarkEditorFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [icon, setIcon] = useState(initialData?.icon || 'Compass');
  const [categoryId, setCategoryId] = useState<number | null>(
    initialData?.categoryId !== undefined ? initialData.categoryId : null
  );
  const [sortOrder, setSortOrder] = useState<number>(initialData?.sortOrder ?? 0);

  const [categoriesList, setCategoriesList] = useState(initialCategories);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await createBookmarkCategoryAction({ name: newCatName.trim() });
      if (res.category) {
        setCategoriesList((prev) => [...prev, res.category!]);
        setCategoryId(res.category.id);
        setNewCatName('');
        setShowAddCat(false);
      } else {
        alert(res.error || '添加分类失败');
      }
    } catch {
      alert('添加分类出错');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setError('请输入网站标题');
      return;
    }
    if (!url.trim()) {
      setError('请输入网站链接 URL');
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      url: url.trim(),
      description: description.trim() || undefined,
      icon: icon.trim() || undefined,
      categoryId: categoryId ? Number(categoryId) : null,
      sortOrder: Number(sortOrder) || 0,
    };

    try {
      if (isEdit && initialData?.id) {
        const res = await updateBookmarkAction(initialData.id, payload);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccessMsg('导航书签更新成功！');
          setTimeout(() => {
            router.push('/admin/bookmarks');
            router.refresh();
          }, 600);
        }
      } else {
        const res = await createBookmarkAction(payload);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccessMsg('导航书签创建成功！');
          setTimeout(() => {
            router.push('/admin/bookmarks');
            router.refresh();
          }, 600);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '保存失败，请稍后重试';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    setDeleting(true);
    try {
      const res = await deleteBookmarkAction(initialData.id);
      if (res.error) {
        alert(res.error);
      } else {
        router.push('/admin/bookmarks');
        router.refresh();
      }
    } catch {
      alert('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e2d8] pb-5 dark:border-[#2d313c]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookmarks"
            className="rounded-xl border border-[#d1d5db] p-2 text-[#4f566b] hover:bg-[#e6e2d8] hover:text-[#1a1c23] dark:border-[#393e4f] dark:text-[#9ca3af] dark:hover:bg-[#22252e] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1a1c23] dark:text-[#f3f4f6]">
              {isEdit ? '编辑导航书签' : '添加网址导航'}
            </h1>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
              整理汇聚精选技术站点与工具指引
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEdit && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#b83b3b]/30 bg-[#b83b3b]/10 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#b83b3b] hover:bg-[#b83b3b]/20 dark:border-[#b83b3b]/40 dark:text-[#f87171] transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>删除书签</span>
            </button>
          )}

          <Button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#1a1c23] px-5 py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-[#272a34] dark:bg-[#f3f4f6] dark:text-[#121316] dark:hover:bg-[#e5e7eb] transition-all"
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin text-[#b83b3b]" />
                <span>保存中...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="h-4 w-4" />
                <span>{isEdit ? '更新书签' : '保存书签'}</span>
              </span>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-[#b83b3b]/10 p-3.5 text-xs text-[#b83b3b] dark:bg-[#b83b3b]/20 dark:text-[#f87171] border border-[#b83b3b]/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <Card className="rounded-2xl border border-[#e6e2d8] p-6 shadow-xs dark:border-[#2d313c] dark:bg-[#1a1c22] space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
              网站名称 <span className="text-[#b83b3b]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：GitHub"
              className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-sm text-[#1a1c23] placeholder-[#9ca3af] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af]">
                网站网址 (URL) <span className="text-[#b83b3b]">*</span>
              </label>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#b83b3b] hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>访问测试</span>
                </a>
              )}
            </div>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com"
              className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-sm font-mono text-[#1a1c23] placeholder-[#9ca3af] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af]">
                所属分类
              </label>
              <button
                type="button"
                onClick={() => setShowAddCat(!showAddCat)}
                className="inline-flex items-center gap-1 text-[11px] text-[#b83b3b] hover:underline"
              >
                <Plus className="h-3 w-3" />
                <span>新建分类</span>
              </button>
            </div>

            {showAddCat && (
              <div className="flex gap-2 mb-2 p-2 bg-[#faf8f5] dark:bg-[#121316] rounded-xl border border-[#e6e2d8] dark:border-[#2d313c]">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="分类名称"
                  className="flex-1 bg-transparent text-xs py-1 px-2 border border-[#d1d5db] dark:border-[#393e4f] rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="bg-[#1a1c23] text-white text-xs px-2.5 py-1 rounded-lg dark:bg-[#f3f4f6] dark:text-[#121316]"
                >
                  添加
                </button>
              </div>
            )}

            <select
              value={categoryId !== null ? String(categoryId) : ''}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-sm text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6] dark:bg-[#1a1c22]"
            >
              <option value="">未指定分类</option>
              {categoriesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Icon Name & Sort Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                图标标识 (Lucide)
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="例如：Github, Code, Globe"
                className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-sm text-[#1a1c23] placeholder-[#9ca3af] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                排序权重
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-sm text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
            简述说明
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="介绍此网站的特色、用途或收录理由..."
            className="w-full rounded-xl border border-[#d1d5db] bg-transparent p-3 text-sm text-[#1a1c23] placeholder-[#9ca3af] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
          />
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {isEdit && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="确认删除导航书签"
          message={`您确定要删除 "${initialData?.title}" 吗？此操作无法撤销。`}
          confirmText="确认彻底删除"
          isLoading={deleting}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </form>
  );
}
