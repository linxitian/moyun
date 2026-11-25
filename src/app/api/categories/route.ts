import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories, posts } from '@/lib/db/schema';
import { asc, eq, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const allCategories = db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        sortOrder: categories.sortOrder,
      })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.id))
      .all();

    // Get post counts for each category
    const categoriesWithCount = allCategories.map((cat) => {
      const countRes = db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(eq(posts.categoryId, cat.id))
        .get();
      return {
        ...cat,
        postCount: countRes ? countRes.count : 0,
      };
    });

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const catSlug = slug ? slugify(slug) : slugify(name);

    const existing = db.select().from(categories).where(eq(categories.slug, catSlug)).get();
    if (existing) {
      return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 409 });
    }

    const created = db
      .insert(categories)
      .values({
        name,
        slug: catSlug,
        description: description || null,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      })
      .returning()
      .get();

    return NextResponse.json({ category: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
