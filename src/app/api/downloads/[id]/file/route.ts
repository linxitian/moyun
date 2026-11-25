import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { downloads } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { isDownloadAvailable, serveUpload } from '@/lib/uploads';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const downloadId = Number(id);

    if (!Number.isSafeInteger(downloadId) || downloadId < 1) {
      return NextResponse.json({ error: '无效的下载资源 ID' }, { status: 400 });
    }

    const item = db.select().from(downloads).where(eq(downloads.id, downloadId)).get();
    if (!item) {
      return NextResponse.json({ error: '未找到该下载资源' }, { status: 404 });
    }

    if (!isDownloadAvailable(item.filePath)) {
      return NextResponse.json({ error: '文件不存在或已移除' }, { status: 404 });
    }
    const response = /^https?:\/\//i.test(item.filePath)
      ? NextResponse.redirect(new URL(item.filePath))
      : serveUpload(item.filePath, item.fileName);
    if (response.status >= 400) return response;

    // Count only downloads that can actually be served.
    if (request.method === 'GET') {
      db.update(downloads)
        .set({ downloadCount: sql`${downloads.downloadCount} + 1` })
        .where(eq(downloads.id, downloadId))
        .run();
    }

    return response;
  } catch (error) {
    console.error('Error serving file download:', error);
    return NextResponse.json({ error: '文件下载失败' }, { status: 500 });
  }
}
