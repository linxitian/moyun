'use server';

import { db } from '@/lib/db';
import { bookmarks, bookmarkCategories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export interface BookmarkFormData {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  categoryId?: number | null;
  sortOrder?: number;
}

export async function createBookmarkAction(data: BookmarkFormData) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return { error: '未经授权，请先登录' };
    }

    if (!data.title?.trim()) {
      return { error: '网站名称不能为空' };
    }
    if (!data.url?.trim()) {
      return { error: '网站链接不能为空' };
    }

    const inserted = db
      .insert(bookmarks)
      .values({
        title: data.title.trim(),
        url: data.url.trim(),
        description: data.description?.trim() || null,
        icon: data.icon?.trim() || null,
        categoryId: data.categoryId ? Number(data.categoryId) : null,
        sortOrder: Number(data.sortOrder) || 0,
      })
      .returning()
      .get();

    revalidatePath('/admin');
    revalidatePath('/admin/bookmarks');
    revalidatePath('/nav');
    revalidatePath('/');

    return { success: true, bookmark: inserted };
  } catch (error) {
    console.error('Error in createBookmarkAction:', error);
    return { error: '添加网站导航失败' };
  }
}

export async function updateBookmarkAction(id: number, data: BookmarkFormData) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return { error: '未经授权，请先登录' };
    }

    const existing = db.select().from(bookmarks).where(eq(bookmarks.id, id)).get();
    if (!existing) {
      return { error: '未找到该导航书签' };
    }

    if (!data.title?.trim()) {
      return { error: '网站名称不能为空' };
    }
    if (!data.url?.trim()) {
      return { error: '网站链接不能为空' };
    }

    const updated = db
      .update(bookmarks)
      .set({
        title: data.title.trim(),
        url: data.url.trim(),
        description: data.description?.trim() || null,
        icon: data.icon?.trim() || null,
        categoryId: data.categoryId ? Number(data.categoryId) : null,
        sortOrder: Number(data.sortOrder) || 0,
      })
      .where(eq(bookmarks.id, id))
      .returning()
      .get();

    revalidatePath('/admin');
    revalidatePath('/admin/bookmarks');
    revalidatePath('/nav');
    revalidatePath('/');

    return { success: true, bookmark: updated };
  } catch (error) {
    console.error('Error in updateBookmarkAction:', error);
    return { error: '更新导航书签失败' };
  }
}

export async function deleteBookmarkAction(id: number) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return { error: '未经授权，请先登录' };
    }

    const result = db.delete(bookmarks).where(eq(bookmarks.id, id)).returning().get();
    if (!result) {
      return { error: '未找到该导航书签' };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/bookmarks');
    revalidatePath('/nav');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error in deleteBookmarkAction:', error);
    return { error: '删除导航书签失败' };
  }
}

export async function createBookmarkCategoryAction(data: {
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
}) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return { error: '未经授权，请先登录' };
    }

    if (!data.name?.trim()) {
      return { error: '分类名称不能为空' };
    }

    const catSlug = data.slug?.trim() ? slugify(data.slug.trim()) : slugify(data.name.trim());
    const existing = db.select().from(bookmarkCategories).where(eq(bookmarkCategories.slug, catSlug)).get();
    if (existing) {
      return { error: `已存在别名为 "${catSlug}" 的导航分类` };
    }

    const inserted = db
      .insert(bookmarkCategories)
      .values({
        name: data.name.trim(),
        slug: catSlug,
        icon: data.icon?.trim() || null,
        description: data.description?.trim() || null,
        sortOrder: Number(data.sortOrder) || 0,
      })
      .returning()
      .get();

    revalidatePath('/admin/bookmarks');
    revalidatePath('/nav');

    return { success: true, category: inserted };
  } catch (error) {
    console.error('Error in createBookmarkCategoryAction:', error);
    return { error: '创建导航分类失败' };
  }
}

export async function deleteBookmarkCategoryAction(id: number) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return { error: '未经授权，请先登录' };
    }

    // Unassign category from bookmarks
    db.update(bookmarks).set({ categoryId: null }).where(eq(bookmarks.categoryId, id)).run();
    db.delete(bookmarkCategories).where(eq(bookmarkCategories.id, id)).run();

    revalidatePath('/admin/bookmarks');
    revalidatePath('/nav');

    return { success: true };
  } catch (error) {
    console.error('Error in deleteBookmarkCategoryAction:', error);
    return { error: '删除分类失败' };
  }
}
