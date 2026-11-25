import React from 'react';
import { db } from '@/lib/db';
import { bookmarkCategories } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { BookmarkEditorForm } from '@/components/admin/BookmarkEditorForm';

export const dynamic = 'force-dynamic';

export default async function NewBookmarkPage() {
  const allCategories = db
    .select({ id: bookmarkCategories.id, name: bookmarkCategories.name })
    .from(bookmarkCategories)
    .orderBy(asc(bookmarkCategories.sortOrder), asc(bookmarkCategories.name))
    .all();

  return (
    <BookmarkEditorForm
      categories={allCategories}
      isEdit={false}
    />
  );
}
