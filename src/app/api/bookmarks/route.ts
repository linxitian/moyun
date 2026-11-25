import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookmarks, bookmarkCategories } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const cats = db
      .select()
      .from(bookmarkCategories)
      .orderBy(asc(bookmarkCategories.sortOrder), asc(bookmarkCategories.id))
      .all();

    const allBookmarks = db
      .select({
        id: bookmarks.id,
        title: bookmarks.title,
        url: bookmarks.url,
        description: bookmarks.description,
        icon: bookmarks.icon,
        categoryId: bookmarks.categoryId,
        sortOrder: bookmarks.sortOrder,
        createdAt: bookmarks.createdAt,
      })
      .from(bookmarks)
      .orderBy(asc(bookmarks.sortOrder), asc(bookmarks.id))
      .all();

    const grouped = cats.map((cat) => ({
      ...cat,
      bookmarks: allBookmarks.filter((bm) => bm.categoryId === cat.id),
    }));

    return NextResponse.json({
      categories: grouped,
      totalBookmarks: allBookmarks.length,
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, url, description, icon, categoryId, sortOrder } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    const created = db
      .insert(bookmarks)
      .values({
        title,
        url,
        description: description || null,
        icon: icon || null,
        categoryId: categoryId ? Number(categoryId) : null,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      })
      .returning()
      .get();

    return NextResponse.json({ bookmark: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
  }
}
