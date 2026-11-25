import React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { db } from '@/lib/db';
import { bookmarks, bookmarkCategories } from '@/lib/db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { Container } from '@/components/layout/Container';
import { BookmarkCard } from '@/components/ui/BookmarkCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { InkDivider } from '@/components/ui/InkDivider';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const revalidate = 0;

interface NavPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

export default async function NavPage({ searchParams }: NavPageProps) {
  const { category: categorySlug, q } = await searchParams;

  // 1. Fetch all bookmark categories
  const allCategories = db
    .select()
    .from(bookmarkCategories)
    .orderBy(asc(bookmarkCategories.sortOrder))
    .all();

  // 2. Fetch all bookmarks with category info
  const allBookmarksQuery = db
    .select({
      id: bookmarks.id,
      title: bookmarks.title,
      url: bookmarks.url,
      description: bookmarks.description,
      icon: bookmarks.icon,
      categoryId: bookmarks.categoryId,
      categoryName: bookmarkCategories.name,
      categorySlug: bookmarkCategories.slug,
      sortOrder: bookmarks.sortOrder,
    })
    .from(bookmarks)
    .leftJoin(bookmarkCategories, eq(bookmarks.categoryId, bookmarkCategories.id))
    .orderBy(asc(bookmarks.sortOrder), desc(bookmarks.createdAt));

  let bookmarkList = allBookmarksQuery.all();

  // Apply search query if provided
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    bookmarkList = bookmarkList.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        (b.description && b.description.toLowerCase().includes(term)) ||
        b.url.toLowerCase().includes(term)
    );
  }

  // Filter by category if specified
  if (categorySlug) {
    bookmarkList = bookmarkList.filter((b) => b.categorySlug === categorySlug);
  }

  // Group bookmarks by category for display
  const selectedCategory = categorySlug
    ? allCategories.find((c) => c.slug === categorySlug)
    : null;

  return (
    <div className="py-12 sm:py-16">
      <Container size="lg">
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0ece1]/70 dark:bg-[#1a1c22]/80 border border-[#e6e2d8] dark:border-[#2d313c] text-xs font-serif text-[#2d3a4b] dark:text-[#90caf9] mb-4">
              <Compass className="w-3.5 h-3.5" />
              <span>行者常至 · 导航指引</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-wider text-[#1a1c23] dark:text-[#f3f4f6] mb-4">
              精选导航
            </h1>
            <p className="text-sm sm:text-base font-serif text-[#4f566b] dark:text-[#9ca3af] leading-relaxed">
              汇集优质开源项目、权威官方文档与灵感设计资源，指引数字探索之路。
            </p>
          </div>
        </ScrollReveal>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          {/* Category Tabs */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            <Link
              href="/nav"
              className={`px-4 py-1.5 rounded-full text-xs font-serif font-medium transition-all ${
                !categorySlug
                  ? 'bg-[#1a1c23] text-white dark:bg-[#f3f4f6] dark:text-[#121316] shadow-sm'
                  : 'bg-[#f0ece1]/70 text-[#4f566b] hover:bg-[#e6e2d8] hover:text-[#1a1c23] dark:bg-[#22252e] dark:text-[#9ca3af] dark:hover:bg-[#2d313c]'
              }`}
            >
              全部导航
            </Link>

            {allCategories.map((cat) => {
              const active = categorySlug === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/nav?category=${cat.slug}`}
                  className={`px-4 py-1.5 rounded-full text-xs font-serif font-medium transition-all ${
                    active
                      ? 'bg-[#2d3a4b] text-white shadow-sm'
                      : 'bg-[#f0ece1]/70 text-[#4f566b] hover:bg-[#e6e2d8] hover:text-[#1a1c23] dark:bg-[#22252e] dark:text-[#9ca3af] dark:hover:bg-[#2d313c]'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="w-full md:w-80">
            <SearchBar defaultValue={q || ''} placeholder="检索导航资源..." />
          </div>
        </div>

        {/* Content Section: Grouped or Filtered */}
        {categorySlug ? (
          // Single category view
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-serif font-bold text-[#1a1c23] dark:text-[#f3f4f6]">
                {selectedCategory?.name || '分类导航'}
              </h2>
              {selectedCategory?.description && (
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] font-serif mt-1">
                  {selectedCategory.description}
                </p>
              )}
            </div>

            {bookmarkList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkList.map((bm, idx) => (
                  <ScrollReveal key={bm.id} direction="up" delay={idx * 0.05}>
                    <BookmarkCard
                      title={bm.title}
                      url={bm.url}
                      description={bm.description}
                      icon={bm.icon}
                      categoryName={bm.categoryName}
                    />
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/40 dark:bg-[#1a1c22]/40 border border-dashed border-[#e6e2d8] dark:border-[#2d313c] rounded-2xl">
                <p className="text-sm font-serif text-[#6b7280] dark:text-[#9ca3af]">
                  此分类下暂未收录书签。
                </p>
              </div>
            )}
          </div>
        ) : (
          // Grouped all categories view
          <div className="space-y-12">
            {allCategories.map((cat, catIdx) => {
              const catBookmarks = bookmarkList.filter((b) => b.categoryId === cat.id);
              if (catBookmarks.length === 0) return null;

              return (
                <section key={cat.id}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-[#1a1c23] dark:text-[#f3f4f6] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2d3a4b] dark:bg-[#90caf9]" />
                        <span>{cat.name}</span>
                      </h2>
                      {cat.description && (
                        <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] font-serif mt-1">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/nav?category=${cat.slug}`}
                      className="text-xs font-serif text-[#4f566b] dark:text-[#9ca3af] hover:text-[#b83b3b] dark:hover:text-[#d24e4e] transition-colors"
                    >
                      查看更多 →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catBookmarks.map((bm, idx) => (
                      <ScrollReveal key={bm.id} direction="up" delay={idx * 0.04}>
                        <BookmarkCard
                          title={bm.title}
                          url={bm.url}
                          description={bm.description}
                          icon={bm.icon}
                          categoryName={bm.categoryName}
                        />
                      </ScrollReveal>
                    ))}
                  </div>

                  {catIdx < allCategories.length - 1 && (
                    <InkDivider className="my-10 opacity-50" />
                  )}
                </section>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
