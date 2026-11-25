import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { downloads } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const query = db
      .select()
      .from(downloads)
      .orderBy(desc(downloads.createdAt));

    const allDownloads = category
      ? query.where(eq(downloads.category, category)).all()
      : query.all();

    return NextResponse.json({ downloads: allDownloads });
  } catch (error) {
    console.error('Error fetching downloads:', error);
    return NextResponse.json({ error: 'Failed to fetch downloads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, fileName, filePath, fileSize, fileType, category } = body;

    if (!title || !fileName || !filePath) {
      return NextResponse.json({ error: 'Title, fileName and filePath are required' }, { status: 400 });
    }

    const created = db
      .insert(downloads)
      .values({
        title,
        description: description || null,
        fileName,
        filePath,
        fileSize: fileSize ? Number(fileSize) : 0,
        fileType: fileType || null,
        category: category || null,
        downloadCount: 0,
      })
      .returning()
      .get();

    return NextResponse.json({ download: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating download item:', error);
    return NextResponse.json({ error: 'Failed to create download item' }, { status: 500 });
  }
}
