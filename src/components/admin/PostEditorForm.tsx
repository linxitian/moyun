'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Eye, Loader2, Check, AlertCircle, Plus, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { slugify } from '@/lib/utils';
import { ImageUploader } from './ImageUploader';
import { MarkdownEditor } from './MarkdownEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { createPostAction, updatePostAction, deletePostAction } from '@/lib/actions/posts';

export interface PostEditorData {
  id?: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  categoryId?: number | null;
  status: 'draft' | 'published';
  pinned?: boolean | null;
  tagIds?: number[];
}

interface PostEditorFormProps {
  initialData?: PostEditorData;
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
  isEdit?: boolean;
}

export function PostEditorForm({
  initialData,
  categories: initialCategories,
  tags: initialTags,
  isEdit = false,
}: PostEditorFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialData?.slug));
  const [content, setContent] = useState(initialData?.content || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [categoryId, setCategoryId] = useState<number | null>(
    initialData?.categoryId !== undefined ? initialData.categoryId : null
  );
  const [status, setStatus] = useState<'draft' | 'published'>(
    initialData?.status || 'published'
  );
  const [pinned, setPinned] = useState(Boolean(initialData?.pinned));
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    initialData?.tagIds || []
  );

  // Categories & Tags list state (allows inline creation)
  const [categoriesList, setCategoriesList] = useState(initialCategories);
  const [tagsList, setTagsList] = useState(initialTags);
  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);

  // Loading and alerts
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slugManuallyEdited && !isEdit) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setSlugManuallyEdited(true);
  };

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // Quick inline category addition
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.category) {
        setCategoriesList((prev) => [...prev, data.category]);
        setCategoryId(data.category.id);
        setNewCatName('');
        setShowAddCat(false);
      } else {
        alert(data.error || '添加分类失败');
      }
    } catch {
      alert('添加分类出错');
    }
  };

  // Quick inline tag addition
  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.tag) {
        setTagsList((prev) => [...prev, data.tag]);
        setSelectedTagIds((prev) => [...prev, data.tag.id]);
        setNewTagName('');
        setShowAddTag(false);
      } else {
        alert(data.error || '添加标签失败');
      }
    } catch {
      alert('添加标签出错');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setError('请输入文章标题');
      return;
    }
    if (!content.trim()) {
      setError('请输入文章内容');
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim() ? slugify(slug.trim()) : slugify(title.trim()),
      content,
      excerpt: excerpt.trim() || null,
      coverImage: coverImage.trim() || null,
      categoryId: categoryId ? Number(categoryId) : null,
      status,
      pinned,
      tagIds: selectedTagIds,
    };

    try {
      if (isEdit && initialData?.id) {
        const res = await updatePostAction(initialData.id, payload);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccessMsg('博文更新成功！');
          setTimeout(() => {
            router.push('/admin/posts');
            router.refresh();
          }, 600);
        }
      } else {
        const res = await createPostAction(payload);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccessMsg('博文发布成功！');
          setTimeout(() => {
            router.push('/admin/posts');
            router.refresh();
          }, 600);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    setDeleting(true);
    try {
      const res = await deletePostAction(initialData.id);
      if (res.error) {
        alert(res.error);
      } else {
        router.push('/admin/posts');
        router.refresh();
      }
    } catch {
      alert('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e2d8] pb-5 dark:border-[#2d313c]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="rounded-xl border border-[#d1d5db] p-2 text-[#4f566b] hover:bg-[#e6e2d8] hover:text-[#1a1c23] dark:border-[#393e4f] dark:text-[#9ca3af] dark:hover:bg-[#22252e] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1a1c23] dark:text-[#f3f4f6]">
              {isEdit ? '编辑博文' : '撰写新博文'}
            </h1>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
              {isEdit ? `当前编辑：${initialData?.title}` : '下笔如流水，意韵自天成'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEdit && initialData?.slug && (
            <Link
              href={`/blog/${initialData.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#d1d5db] bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-[#1a1c23] hover:bg-[#faf8f5] dark:border-[#393e4f] dark:bg-[#1a1c22] dark:text-[#f3f4f6] dark:hover:bg-[#22252e] transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>在前台预览</span>
            </Link>
          )}

          {isEdit && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#b83b3b]/30 bg-[#b83b3b]/10 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#b83b3b] hover:bg-[#b83b3b]/20 dark:border-[#b83b3b]/40 dark:text-[#f87171] transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>删除</span>
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
                <span>{isEdit ? '更新文章' : '立即发布'}</span>
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Error & Success Alerts */}
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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Title, Slug, Content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border border-[#e6e2d8] p-5 sm:p-6 shadow-xs dark:border-[#2d313c] dark:bg-[#1a1c22] space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                博文标题 <span className="text-[#b83b3b]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="例如：水墨之韵：构建现代全栈架构的极简美学"
                className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2.5 px-3.5 text-base sm:text-lg font-serif font-bold text-[#1a1c23] placeholder-[#9ca3af] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6] dark:focus:border-[#f3f4f6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                文章别名 (Slug) <span className="text-[#b83b3b]">*</span>
              </label>
              <div className="flex items-center rounded-xl border border-[#d1d5db] bg-[#faf8f5]/50 px-3.5 dark:border-[#393e4f] dark:bg-[#121316]">
                <span className="font-mono text-xs text-[#9ca3af]">/blog/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="post-slug"
                  className="w-full bg-transparent py-2 px-1 font-mono text-xs sm:text-sm text-[#1a1c23] focus:outline-none dark:text-[#f3f4f6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                内容正文 (Markdown) <span className="text-[#b83b3b]">*</span>
              </label>
              <MarkdownEditor value={content} onChange={setContent} minHeight="480px" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#4f566b] dark:text-[#9ca3af]">
                  文章摘要 (Excerpt)
                </label>
                <span className="text-[11px] text-[#9ca3af]">
                  {excerpt.length} 字
                </span>
              </div>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="简述文章要旨，将在文章列表和 SEO 元数据中展示..."
                className="w-full rounded-xl border border-[#d1d5db] bg-transparent p-3 text-xs sm:text-sm text-[#1a1c23] placeholder-[#9ca3af] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Meta Settings (1 col) */}
        <div className="space-y-6">
          {/* Publish & Status Card */}
          <Card className="rounded-2xl border border-[#e6e2d8] p-5 shadow-xs dark:border-[#2d313c] dark:bg-[#1a1c22] space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#1a1c23] dark:text-[#f3f4f6] border-b border-[#e6e2d8] pb-3 dark:border-[#2d313c]">
              发布属性
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                发布状态
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-xs sm:text-sm text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6] dark:bg-[#1a1c22]"
              >
                <option value="published">已发布 (公开可见)</option>
                <option value="draft">草稿箱 (仅后台可见)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label
                htmlFor="pinned-toggle"
                className="text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] cursor-pointer"
              >
                置顶推荐
              </label>
              <input
                id="pinned-toggle"
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-4 w-4 rounded border-[#d1d5db] text-[#b83b3b] focus:ring-[#b83b3b] cursor-pointer"
              />
            </div>
          </Card>

          {/* Category & Tags Card */}
          <Card className="rounded-2xl border border-[#e6e2d8] p-5 shadow-xs dark:border-[#2d313c] dark:bg-[#1a1c22] space-y-5">
            <h3 className="font-serif font-bold text-sm text-[#1a1c23] dark:text-[#f3f4f6] border-b border-[#e6e2d8] pb-3 dark:border-[#2d313c]">
              分类与标签
            </h3>

            {/* Category Select */}
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
                  <span>新增分类</span>
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
                className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-xs sm:text-sm text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6] dark:bg-[#1a1c22]"
              >
                <option value="">未指定分类</option>
                {categoriesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af]">
                  文章标签
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddTag(!showAddTag)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#b83b3b] hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  <span>新增标签</span>
                </button>
              </div>

              {showAddTag && (
                <div className="flex gap-2 mb-2 p-2 bg-[#faf8f5] dark:bg-[#121316] rounded-xl border border-[#e6e2d8] dark:border-[#2d313c]">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="标签名称"
                    className="flex-1 bg-transparent text-xs py-1 px-2 border border-[#d1d5db] dark:border-[#393e4f] rounded-lg focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-[#1a1c23] text-white text-xs px-2.5 py-1 rounded-lg dark:bg-[#f3f4f6] dark:text-[#121316]"
                  >
                    添加
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                {tagsList.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#1a1c23] text-white dark:bg-[#f3f4f6] dark:text-[#121316]'
                          : 'border border-[#d1d5db] text-[#4f566b] hover:bg-[#e6e2d8] dark:border-[#393e4f] dark:text-[#9ca3af] dark:hover:bg-[#22252e]'
                      }`}
                    >
                      <TagIcon className="h-3 w-3" />
                      <span>{tag.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Cover Image Card */}
          <Card className="rounded-2xl border border-[#e6e2d8] p-5 shadow-xs dark:border-[#2d313c] dark:bg-[#1a1c22]">
            <ImageUploader
              value={coverImage}
              onChange={setCoverImage}
              label="文章封面图"
              placeholder="/uploads/cover.jpg 或图片 URL"
            />
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isEdit && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="确认删除该博文"
          message={`您确定要删除文章 "${initialData?.title}" 吗？此操作无法撤销。`}
          confirmText="确认彻底删除"
          isLoading={deleting}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </form>
  );
}
