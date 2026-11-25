import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, categories, tags, postTags } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isNumeric = /^\d+$/.test(id);

    const post = isNumeric
      ? db
          .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            content: posts.content,
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
          .where(eq(posts.id, Number(id)))
          .get()
      : db
          .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            content: posts.content,
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
          .where(eq(posts.slug, id))
          .get();

    if (!post || (post.status !== 'published' && (await auth())?.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment viewCount if not requested by admin
    const { searchParams } = new URL(request.url);
    if (searchParams.get('incView') === 'true') {
      db.update(posts)
        .set({ viewCount: sql`${posts.viewCount} + 1` })
        .where(eq(posts.id, post.id))
        .run();
    }

    // Fetch tags
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

    return NextResponse.json({
      post: {
        ...post,
        tags: pTags,
      },
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const postId = Number(id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    const existing = db.select().from(posts).where(eq(posts.id, postId)).get();
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, slug, content, excerpt, coverImage, categoryId, status, pinned, tagIds } = body;

    const postSlug = slug ? slugify(slug) : undefined;

    // Check slug uniqueness if changed
    if (postSlug && postSlug !== existing.slug) {
      const conflict = db.select().from(posts).where(eq(posts.slug, postSlug)).get();
      if (conflict) {
        return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
      }
    }

    const updated = db
      .update(posts)
      .set({
        ...(title && { title }),
        ...(postSlug && { slug: postSlug }),
        ...(content && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(coverImage !== undefined && { coverImage }),
        ...(categoryId !== undefined && { categoryId: categoryId ? Number(categoryId) : null }),
        ...(status && { status }),
        ...(pinned !== undefined && { pinned: Boolean(pinned) }),
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(posts.id, postId))
      .returning()
      .get();

    // Update tags if provided
    if (Array.isArray(tagIds)) {
      db.delete(postTags).where(eq(postTags.postId, postId)).run();
      for (const tagId of tagIds) {
        db.insert(postTags).values({
          postId,
          tagId: Number(tagId),
        }).run();
      }
    }

    return NextResponse.json({ post: updated });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const postId = Number(id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    const result = db.delete(posts).where(eq(posts.id, postId)).returning().get();
    if (!result) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
