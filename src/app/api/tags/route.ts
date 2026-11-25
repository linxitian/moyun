import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tags, postTags } from '@/lib/db/schema';
import { asc, eq, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const allTags = db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(tags)
      .orderBy(asc(tags.name))
      .all();

    // Attach post count
    const tagsWithCount = allTags.map((tag) => {
      const countRes = db
        .select({ count: sql<number>`count(*)` })
        .from(postTags)
        .where(eq(postTags.tagId, tag.id))
        .get();
      return {
        ...tag,
        postCount: countRes ? countRes.count : 0,
      };
    });

    return NextResponse.json({ tags: tagsWithCount });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug } = body;

    if (!name) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    const tagSlug = slug ? slugify(slug) : slugify(name);

    const existing = db.select().from(tags).where(eq(tags.slug, tagSlug)).get();
    if (existing) {
      return NextResponse.json({ error: 'Tag with this slug already exists' }, { status: 409 });
    }

    const created = db
      .insert(tags)
      .values({
        name,
        slug: tagSlug,
      })
      .returning()
      .get();

    return NextResponse.json({ tag: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
