import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, categories, tags, postTags } from '@/lib/db/schema';
import { eq, desc, and, like, or } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const tagSlug = searchParams.get('tag');
    const requestedStatus = searchParams.get('status') || 'published';
    const session = requestedStatus !== 'published' ? await auth() : null;
    const status = session?.user?.role === 'admin' ? requestedStatus : 'published';
    const query = searchParams.get('q');
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(200, Math.max(1, Number.parseInt(searchParams.get('limit') || '10') || 10));
    const offset = (page - 1) * limit;

    const conditions = [];

    // Filter by status (unless admin requests 'all')
    if (status !== 'all') {
      conditions.push(eq(posts.status, status));
    }

    // Filter by category
    if (categorySlug) {
      const category = db.select().from(categories).where(eq(categories.slug, categorySlug)).get();
      if (category) {
        conditions.push(eq(posts.categoryId, category.id));
      } else {
        return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 });
      }
    }

    // Search query
    if (query) {
      conditions.push(
        or(
          like(posts.title, `%${query}%`),
          like(posts.excerpt, `%${query}%`),
          like(posts.content, `%${query}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Filter by tag if requested
    let matchedPostIds: number[] | null = null;
    if (tagSlug) {
      const tag = db.select().from(tags).where(eq(tags.slug, tagSlug)).get();
      if (!tag) {
        return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 });
      }
      const pTags = db.select({ postId: postTags.postId }).from(postTags).where(eq(postTags.tagId, tag.id)).all();
      matchedPostIds = pTags.map((pt) => pt.postId);
      if (matchedPostIds.length === 0) {
        return NextResponse.json({ posts: [], total: 0, page, totalPages: 0 });
      }
    }

    let allPosts = db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        coverImage: posts.coverImage,
        categoryId: posts.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        status: posts.status,
        pinned: posts.pinned,
        viewCount: posts.viewCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(posts.pinned), desc(posts.createdAt))
      .all();

    if (matchedPostIds !== null) {
      allPosts = allPosts.filter((p) => matchedPostIds!.includes(p.id));
    }

    const total = allPosts.length;
    const paginatedPosts = allPosts.slice(offset, offset + limit);

    // Fetch tags for each post
    const postsWithTags = paginatedPosts.map((post) => {
      const pTags = db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, post.id))
        .all();

      return {
        ...post,
        tags: pTags,
      };
    });

    return NextResponse.json({
      posts: postsWithTags,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, excerpt, coverImage, categoryId, status, pinned, tagIds } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const postSlug = slug ? slugify(slug) : slugify(title);

    // Check slug collision
    const existing = db.select({ id: posts.id }).from(posts).where(eq(posts.slug, postSlug)).get();
    if (existing) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
    }

    const result = db.insert(posts).values({
      title,
      slug: postSlug,
      content,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      categoryId: categoryId ? Number(categoryId) : null,
      status: status || 'draft',
      pinned: pinned ? true : false,
      viewCount: 0,
    }).returning().get();

    // Insert post_tags
    if (Array.isArray(tagIds) && tagIds.length > 0) {
      for (const tagId of tagIds) {
        db.insert(postTags).values({
          postId: result.id,
          tagId: Number(tagId),
        }).run();
      }
    }

    return NextResponse.json({ post: result }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
