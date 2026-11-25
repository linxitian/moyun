import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { bookmarks, bookmarkCategories } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { BookmarkEditorForm, BookmarkEditorData } from '@/components/admin/BookmarkEditorForm';

export const dynamic = 'force-dynamic';

export default async function EditBookmarkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookmarkId = Number(id);

  if (isNaN(bookmarkId)) {
    notFound();
  }

  const bookmark = db.select().from(bookmarks).where(eq(bookmarks.id, bookmarkId)).get();
  if (!bookmark) {
    notFound();
  }

  const allCategories = db
    .select({ id: bookmarkCategories.id, name: bookmarkCategories.name })
    .from(bookmarkCategories)
    .orderBy(asc(bookmarkCategories.sortOrder), asc(bookmarkCategories.name))
    .all();

  const initialData: BookmarkEditorData = {
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description,
    icon: bookmark.icon,
    categoryId: bookmark.categoryId,
    sortOrder: bookmark.sortOrder,
  };

  return (
    <BookmarkEditorForm
      initialData={initialData}
      categories={allCategories}
      isEdit={true}
    />
  );
}
