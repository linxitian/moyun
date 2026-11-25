'use server';

import { db } from '@/lib/db';
import { downloads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface DownloadFormData {
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  fileType?: string;
  category?: string;
}

export async function createDownloadAction(data: DownloadFormData) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return { error: '未经授权，请先登录' };
    }

    if (!data.title?.trim()) {
      return { error: '资源标题不能为空' };
    }
    if (!data.filePath?.trim() || !data.fileName?.trim()) {
      return { error: '请上传有效文件' };
    }

    const inserted = db
      .insert(downloads)
      .values({
        title: data.title.trim(),
        description: data.description?.trim() || null,
        fileName: data.fileName.trim(),
        filePath: data.filePath.trim(),
        fileSize: Number(data.fileSize) || 0,
        fileType: data.fileType?.trim() || null,
        category: data.category?.trim() || null,
        downloadCount: 0,
      })
      .returning()
      .get();

    revalidatePath('/admin');
    revalidatePath('/admin/downloads');
    revalidatePath('/archive');
    revalidatePath('/');

    return { success: true, download: inserted };
  } catch (error) {
    console.error('Error in createDownloadAction:', error);
    return { error: '创建下载资源失败' };
  }
}

export async function updateDownloadAction(id: number, data: Partial<DownloadFormData>) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return { error: '未经授权，请先登录' };
    }

    const existing = db.select().from(downloads).where(eq(downloads.id, id)).get();
    if (!existing) {
      return { error: '未找到该下载资源' };
    }

    const updated = db
      .update(downloads)
      .set({
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
        ...(data.fileName !== undefined && { fileName: data.fileName.trim() }),
        ...(data.filePath !== undefined && { filePath: data.filePath.trim() }),
        ...(data.fileSize !== undefined && { fileSize: Number(data.fileSize) || 0 }),
        ...(data.fileType !== undefined && { fileType: data.fileType?.trim() || null }),
        ...(data.category !== undefined && { category: data.category?.trim() || null }),
      })
      .where(eq(downloads.id, id))
      .returning()
      .get();

    revalidatePath('/admin');
    revalidatePath('/admin/downloads');
    revalidatePath('/archive');
    revalidatePath('/');

    return { success: true, download: updated };
  } catch (error) {
    console.error('Error in updateDownloadAction:', error);
    return { error: '更新下载资源失败' };
  }
}

export async function deleteDownloadAction(id: number) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return { error: '未经授权，请先登录' };
    }

    const existing = db.select().from(downloads).where(eq(downloads.id, id)).get();
    if (!existing) {
      return { error: '未找到该下载资源' };
    }

    // Keep the file: other posts or download records may still reference it.
    db.delete(downloads).where(eq(downloads.id, id)).run();

    revalidatePath('/admin');
    revalidatePath('/admin/downloads');
    revalidatePath('/archive');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error in deleteDownloadAction:', error);
    return { error: '删除下载资源失败' };
  }
}
