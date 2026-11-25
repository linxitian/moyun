import React from 'react';
import { db } from '@/lib/db';
import { categories, tags } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { PostEditorForm } from '@/components/admin/PostEditorForm';

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
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

  return (
    <PostEditorForm
      categories={allCategories}
      tags={allTags}
      isEdit={false}
    />
  );
}
