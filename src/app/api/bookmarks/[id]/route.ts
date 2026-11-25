import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookmarks, bookmarkCategories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookmarkId = Number(id);

    if (isNaN(bookmarkId)) {
      return NextResponse.json({ error: '无效的导航书签 ID' }, { status: 400 });
    }

    const item = db
      .select({
        id: bookmarks.id,
        title: bookmarks.title,
        url: bookmarks.url,
        description: bookmarks.description,
        icon: bookmarks.icon,
        categoryId: bookmarks.categoryId,
        categoryName: bookmarkCategories.name,
        sortOrder: bookmarks.sortOrder,
        createdAt: bookmarks.createdAt,
      })
      .from(bookmarks)
      .leftJoin(bookmarkCategories, eq(bookmarks.categoryId, bookmarkCategories.id))
      .where(eq(bookmarks.id, bookmarkId))
      .get();

    if (!item) {
      return NextResponse.json({ error: '未找到该导航书签' }, { status: 404 });
    }

    return NextResponse.json({ bookmark: item });
  } catch (error) {
    console.error('Error fetching bookmark:', error);
    return NextResponse.json({ error: '获取导航书签失败' }, { status: 500 });
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
    const bookmarkId = Number(id);

    if (isNaN(bookmarkId)) {
      return NextResponse.json({ error: '无效的导航书签 ID' }, { status: 400 });
    }

    const existing = db.select().from(bookmarks).where(eq(bookmarks.id, bookmarkId)).get();
    if (!existing) {
      return NextResponse.json({ error: '未找到该导航书签' }, { status: 404 });
    }

    const body = await request.json();
    const { title, url, description, icon, categoryId, sortOrder } = body;

    const updated = db
      .update(bookmarks)
      .set({
        ...(title !== undefined && { title }),
        ...(url !== undefined && { url }),
        ...(description !== undefined && { description: description || null }),
        ...(icon !== undefined && { icon: icon || null }),
        ...(categoryId !== undefined && { categoryId: categoryId ? Number(categoryId) : null }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) || 0 }),
      })
      .where(eq(bookmarks.id, bookmarkId))
      .returning()
      .get();

    return NextResponse.json({ bookmark: updated });
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return NextResponse.json({ error: '更新导航书签失败' }, { status: 500 });
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
    const bookmarkId = Number(id);

    if (isNaN(bookmarkId)) {
      return NextResponse.json({ error: '无效的导航书签 ID' }, { status: 400 });
    }

    const result = db.delete(bookmarks).where(eq(bookmarks.id, bookmarkId)).returning().get();
    if (!result) {
      return NextResponse.json({ error: '未找到该导航书签' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: '书签删除成功' });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json({ error: '删除导航书签失败' }, { status: 500 });
  }
}
