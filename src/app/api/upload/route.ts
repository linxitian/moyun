import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'node:crypto';
import { maxUploadBytes, uploadsDir } from '@/lib/uploads';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: '未经授权，请先登录' }, { status: 401 });
    }

    if (Number(request.headers.get('content-length')) > maxUploadBytes + 1024 * 1024) {
      return NextResponse.json({ error: '文件大小不能超过 25 MB' }, { status: 413 });
    }
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: '未提供上传文件' }, { status: 400 });
    }

    if (file.size === 0 || file.size > maxUploadBytes) {
      return NextResponse.json({ error: '请上传非空文件，最大支持 25 MB' }, { status: 413 });
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    await fs.mkdir(uploadsDir, { recursive: true });

    // Clean original name and generate unique filename
    const originalName = file.name || 'file';
    const originalExt = path.extname(originalName);
    const ext = originalExt.toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 16);
    const baseName = path
      .basename(originalName, originalExt)
      .replace(/[^a-zA-Z0-9_\u4e00-\u9fa5-]/g, '_')
      .slice(0, 50);

    const timestamp = Date.now();
    const randomSuffix = randomUUID();
    const fileName = `${baseName}_${timestamp}_${randomSuffix}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/api/files/${encodeURIComponent(fileName)}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: originalName,
      savedFileName: fileName,
      fileSize: file.size,
      fileType: file.type || ext.replace('.', ''),
    });
  } catch (error) {
    console.error('File upload failed:', error);
    return NextResponse.json(
      { error: '文件上传失败，请稍后重试' },
      { status: 500 }
    );
  }
}
