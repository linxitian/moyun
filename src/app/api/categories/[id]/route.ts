import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories, posts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = Number(id);

    if (isNaN(catId)) {
      return NextResponse.json({ error: '无效的分类 ID' }, { status: 400 });
    }

    const item = db.select().from(categories).where(eq(categories.id, catId)).get();
    if (!item) {
      return NextResponse.json({ error: '未找到该分类' }, { status: 404 });
    }

    return NextResponse.json({ category: item });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 });
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
    const catId = Number(id);

    if (isNaN(catId)) {
      return NextResponse.json({ error: '无效的分类 ID' }, { status: 400 });
    }

    const existing = db.select().from(categories).where(eq(categories.id, catId)).get();
    if (!existing) {
      return NextResponse.json({ error: '未找到该分类' }, { status: 404 });
    }

    const body = await request.json();
    const { name, slug, description, sortOrder } = body;

    const catSlug = slug ? slugify(slug) : undefined;
    if (catSlug && catSlug !== existing.slug) {
      const conflict = db.select().from(categories).where(eq(categories.slug, catSlug)).get();
      if (conflict) {
        return NextResponse.json({ error: '已存在相同别名的分类' }, { status: 409 });
      }
    }

    const updated = db
      .update(categories)
      .set({
        ...(name !== undefined && { name }),
        ...(catSlug !== undefined && { slug: catSlug }),
        ...(description !== undefined && { description: description || null }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) || 0 }),
      })
      .where(eq(categories.id, catId))
      .returning()
      .get();

    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: '更新分类失败' }, { status: 500 });
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
    const catId = Number(id);

    if (isNaN(catId)) {
      return NextResponse.json({ error: '无效的分类 ID' }, { status: 400 });
    }

    // Unassign category from posts before deletion
    db.update(posts).set({ categoryId: null }).where(eq(posts.categoryId, catId)).run();

    const result = db.delete(categories).where(eq(categories.id, catId)).returning().get();
    if (!result) {
      return NextResponse.json({ error: '未找到该分类' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: '分类删除成功' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: '删除分类失败' }, { status: 500 });
  }
}
