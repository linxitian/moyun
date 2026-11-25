'use server';

import { db } from '@/lib/db';
import { posts, postTags } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export interface PostFormData {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  categoryId?: number | null;
  status?: 'draft' | 'published';
  pinned?: boolean;
  tagIds?: number[];
}

export async function createPostAction(data: PostFormData) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return { error: '未经授权，请先登录' };
    }

    if (!data.title?.trim()) {
      return { error: '文章标题不能为空' };
    }
    if (!data.content?.trim()) {
      return { error: '文章内容不能为空' };
    }

    const postSlug = data.slug?.trim() ? slugify(data.slug.trim()) : slugify(data.title.trim());

    // Check slug duplication
    const existing = db.select({ id: posts.id }).from(posts).where(eq(posts.slug, postSlug)).get();
    if (existing) {
      return { error: `已存在别名为 "${postSlug}" 的文章，请修改别名` };
    }

    const inserted = db
      .insert(posts)
      .values({
        title: data.title.trim(),
        slug: postSlug,
        content: data.content,
        excerpt: data.excerpt?.trim() || null,
        coverImage: data.coverImage?.trim() || null,
        categoryId: data.categoryId ? Number(data.categoryId) : null,
        status: data.status || 'draft',
        pinned: Boolean(data.pinned),
        viewCount: 0,
      })
      .returning()
      .get();

    if (Array.isArray(data.tagIds) && data.tagIds.length > 0) {
      for (const tagId of data.tagIds) {
        db.insert(postTags).values({
          postId: inserted.id,
          tagId: Number(tagId),
        }).run();
      }
    }

    revalidatePath('/admin');
    revalidatePath('/admin/posts');
    revalidatePath('/blog');
    revalidatePath('/');

    return { success: true, post: inserted };
  } catch (error) {
    console.error('Error in createPostAction:', error);
    return { error: '发布文章失败，请检查数据后重试' };
  }
}

export async function updatePostAction(id: number, data: PostFormData) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return { error: '未经授权，请先登录' };
    }

    const existing = db.select().from(posts).where(eq(posts.id, id)).get();
    if (!existing) {
      return { error: '未找到该文章' };
    }

    if (!data.title?.trim()) {
      return { error: '文章标题不能为空' };
    }
    if (!data.content?.trim()) {
      return { error: '文章内容不能为空' };
    }

    const postSlug = data.slug?.trim() ? slugify(data.slug.trim()) : existing.slug;

    if (postSlug !== existing.slug) {
      const conflict = db.select().from(posts).where(eq(posts.slug, postSlug)).get();
      if (conflict) {
        return { error: `已存在别名为 "${postSlug}" 的文章，请修改别名` };
      }
    }

    const updated = db
      .update(posts)
      .set({
        title: data.title.trim(),
        slug: postSlug,
        content: data.content,
        excerpt: data.excerpt?.trim() || null,
        coverImage: data.coverImage?.trim() || null,
        categoryId: data.categoryId ? Number(data.categoryId) : null,
        status: data.status || 'draft',
        pinned: Boolean(data.pinned),
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(posts.id, id))
      .returning()
      .get();

    // Re-link tags
    if (Array.isArray(data.tagIds)) {
      db.delete(postTags).where(eq(postTags.postId, id)).run();
      for (const tagId of data.tagIds) {
        db.insert(postTags).values({
          postId: id,
          tagId: Number(tagId),
        }).run();
      }
    }

    revalidatePath('/admin');
    revalidatePath('/admin/posts');
    revalidatePath('/blog');
    revalidatePath(`/blog/${existing.slug}`);
    if (postSlug !== existing.slug) {
      revalidatePath(`/blog/${postSlug}`);
    }
    revalidatePath('/');

    return { success: true, post: updated };
  } catch (error) {
    console.error('Error in updatePostAction:', error);
    return { error: '更新文章失败，请检查数据后重试' };
  }
}

export async function deletePostAction(id: number) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return { error: '未经授权，请先登录' };
    }

    const existing = db.select().from(posts).where(eq(posts.id, id)).get();
    if (!existing) {
      return { error: '未找到该文章' };
    }

    db.delete(postTags).where(eq(postTags.postId, id)).run();
    db.delete(posts).where(eq(posts.id, id)).run();

    revalidatePath('/admin');
    revalidatePath('/admin/posts');
    revalidatePath('/blog');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error in deletePostAction:', error);
    return { error: '删除文章失败，请重试' };
  }
}
