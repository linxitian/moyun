import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookmarkCategories, bookmarks } from '@/lib/db/schema';
import { asc, eq, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const allCategories = db
      .select({
        id: bookmarkCategories.id,
        name: bookmarkCategories.name,
        slug: bookmarkCategories.slug,
        icon: bookmarkCategories.icon,
        description: bookmarkCategories.description,
        sortOrder: bookmarkCategories.sortOrder,
      })
      .from(bookmarkCategories)
      .orderBy(asc(bookmarkCategories.sortOrder), asc(bookmarkCategories.id))
      .all();

    // Attach bookmark counts
    const categoriesWithCount = allCategories.map((cat) => {
      const countRes = db
        .select({ count: sql<number>`count(*)` })
        .from(bookmarks)
        .where(eq(bookmarks.categoryId, cat.id))
        .get();
      return {
        ...cat,
        bookmarkCount: countRes ? countRes.count : 0,
      };
    });

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Error fetching bookmark categories:', error);
    return NextResponse.json({ error: '获取导航分类失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: '未经授权，请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, icon, description, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: '分类名称为必填项' }, { status: 400 });
    }

    const catSlug = slug ? slugify(slug) : slugify(name);

    const existing = db
      .select()
      .from(bookmarkCategories)
      .where(eq(bookmarkCategories.slug, catSlug))
      .get();

    if (existing) {
      return NextResponse.json({ error: '已存在相同别名(slug)的分类' }, { status: 409 });
    }

    const created = db
      .insert(bookmarkCategories)
      .values({
        name,
        slug: catSlug,
        icon: icon || null,
        description: description || null,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      })
      .returning()
      .get();

    return NextResponse.json({ category: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating bookmark category:', error);
    return NextResponse.json({ error: '创建导航分类失败' }, { status: 500 });
  }
}
