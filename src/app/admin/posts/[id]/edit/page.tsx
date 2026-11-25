import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { posts, categories, tags, postTags } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { PostEditorForm, PostEditorData } from '@/components/admin/PostEditorForm';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);

  if (isNaN(postId)) {
    notFound();
  }

  const post = db.select().from(posts).where(eq(posts.id, postId)).get();
  if (!post) {
    notFound();
  }

  // Get current assigned tags
  const currentPostTags = db
    .select({ tagId: postTags.tagId })
    .from(postTags)
    .where(eq(postTags.postId, postId))
    .all();

  const assignedTagIds = currentPostTags.map((t) => t.tagId);

  const allCategories = db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name))
    .all();

  const allTags = db
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .orderBy(asc(tags.name))
    .all();

  const initialData: PostEditorData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    categoryId: post.categoryId,
    status: post.status as 'draft' | 'published',
    pinned: post.pinned,
    tagIds: assignedTagIds,
  };

  return (
    <PostEditorForm
      initialData={initialData}
      categories={allCategories}
      tags={allTags}
      isEdit={true}
    />
  );
}
