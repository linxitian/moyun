import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { downloads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { GET as downloadFile } from './file/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const downloadId = Number(id);

    if (isNaN(downloadId)) {
      return NextResponse.json({ error: '无效的下载资源 ID' }, { status: 400 });
    }

    const item = db.select().from(downloads).where(eq(downloads.id, downloadId)).get();
    if (!item) {
      return NextResponse.json({ error: '未找到该下载资源' }, { status: 404 });
    }

    // Check if client wants JSON info or actual file download
    const { searchParams } = new URL(request.url);
    const acceptHeader = request.headers.get('accept') || '';
    const wantsJson = searchParams.get('info') === 'true' || acceptHeader.includes('application/json');

    if (wantsJson) {
      return NextResponse.json({ download: item });
    }

    return downloadFile(request, { params: Promise.resolve({ id }) });
  } catch (error) {
    console.error('Error handling download request:', error);
    return NextResponse.json({ error: '下载处理失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: '未经授权，请先登录' }, { status: 401 });
    }

    const { id } = await params;
    const downloadId = Number(id);

    if (isNaN(downloadId)) {
      return NextResponse.json({ error: '无效的下载资源 ID' }, { status: 400 });
    }

    const existing = db.select().from(downloads).where(eq(downloads.id, downloadId)).get();
    if (!existing) {
      return NextResponse.json({ error: '未找到该下载资源' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, fileName, filePath, fileSize, fileType, category } = body;

    const updated = db
      .update(downloads)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(fileName !== undefined && { fileName }),
        ...(filePath !== undefined && { filePath }),
        ...(fileSize !== undefined && { fileSize: Number(fileSize) || 0 }),
        ...(fileType !== undefined && { fileType: fileType || null }),
        ...(category !== undefined && { category: category || null }),
      })
      .where(eq(downloads.id, downloadId))
      .returning()
      .get();

    return NextResponse.json({ download: updated });
  } catch (error) {
    console.error('Error updating download item:', error);
    return NextResponse.json({ error: '更新下载资源失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: '未经授权，请先登录' }, { status: 401 });
    }

    const { id } = await params;
    const downloadId = Number(id);

    if (isNaN(downloadId)) {
      return NextResponse.json({ error: '无效的下载资源 ID' }, { status: 400 });
    }

    const result = db.delete(downloads).where(eq(downloads.id, downloadId)).returning().get();
    if (!result) {
      return NextResponse.json({ error: '未找到该下载资源' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: '下载资源删除成功' });
  } catch (error) {
    console.error('Error deleting download item:', error);
    return NextResponse.json({ error: '删除下载资源失败' }, { status: 500 });
  }
}
