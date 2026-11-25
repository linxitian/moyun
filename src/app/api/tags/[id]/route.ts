import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tags, postTags } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tagId = Number(id);

    if (isNaN(tagId)) {
      return NextResponse.json({ error: '无效的标签 ID' }, { status: 400 });
    }

    const item = db.select().from(tags).where(eq(tags.id, tagId)).get();
    if (!item) {
      return NextResponse.json({ error: '未找到该标签' }, { status: 404 });
    }

    return NextResponse.json({ tag: item });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json({ error: '获取标签失败' }, { status: 500 });
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
    const tagId = Number(id);

    if (isNaN(tagId)) {
      return NextResponse.json({ error: '无效的标签 ID' }, { status: 400 });
    }

    const existing = db.select().from(tags).where(eq(tags.id, tagId)).get();
    if (!existing) {
      return NextResponse.json({ error: '未找到该标签' }, { status: 404 });
    }

    const body = await request.json();
    const { name, slug } = body;

    const tagSlug = slug ? slugify(slug) : undefined;
    if (tagSlug && tagSlug !== existing.slug) {
      const conflict = db.select().from(tags).where(eq(tags.slug, tagSlug)).get();
      if (conflict) {
        return NextResponse.json({ error: '已存在相同别名的标签' }, { status: 409 });
      }
    }

    const updated = db
      .update(tags)
      .set({
        ...(name !== undefined && { name }),
        ...(tagSlug !== undefined && { slug: tagSlug }),
      })
      .where(eq(tags.id, tagId))
      .returning()
      .get();

    return NextResponse.json({ tag: updated });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json({ error: '更新标签失败' }, { status: 500 });
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
    const tagId = Number(id);

    if (isNaN(tagId)) {
      return NextResponse.json({ error: '无效的标签 ID' }, { status: 400 });
    }

    db.delete(postTags).where(eq(postTags.tagId, tagId)).run();
    const result = db.delete(tags).where(eq(tags.id, tagId)).returning().get();
    if (!result) {
      return NextResponse.json({ error: '未找到该标签' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: '标签删除成功' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json({ error: '删除标签失败' }, { status: 500 });
  }
}
