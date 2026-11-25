import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { posts, categories, tags, postTags } from '@/lib/db/schema';
import { eq, desc, and, like, or, sql } from 'drizzle-orm';
import { Container } from '@/components/layout/Container';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { TagBadge } from '@/components/ui/TagBadge';

import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export const revalidate = 0;

interface BlogPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

const POSTS_PER_PAGE = 9;

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { q, category: categorySlug, tag: tagSlug, page: pageStr } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr || '1', 10) || 1);

  // 1. Fetch all categories with post counts for filter tabs
  const allCategories = db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      postCount: sql<number>`count(${posts.id})`,
    })
    .from(categories)
    .leftJoin(
      posts,
      and(eq(posts.categoryId, categories.id), eq(posts.status, 'published'))
    )
    .groupBy(categories.id)
    .orderBy(categories.sortOrder)
    .all();

  // Total published post count
  const totalPublishedPosts = db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(eq(posts.status, 'published'))
    .get()?.count || 0;

  // 2. Fetch all tags for secondary filter
  const allTags = db.select().from(tags).all();

  // 3. Resolve category ID if categorySlug is provided
  let selectedCategory: typeof allCategories[0] | undefined;
  if (categorySlug) {
    selectedCategory = allCategories.find((c) => c.slug === categorySlug);
  }

  // 4. Build filter conditions
  const conditions = [eq(posts.status, 'published')];

  if (selectedCategory) {
    conditions.push(eq(posts.categoryId, selectedCategory.id));
  }

  if (q && q.trim()) {
    const searchTerm = `%${q.trim()}%`;
    conditions.push(
      or(
        like(posts.title, searchTerm),
        like(posts.excerpt, searchTerm),
        like(posts.content, searchTerm)
      )!
    );
  }

  // If filtered by tag
  let postIdsWithTag: number[] | null = null;
  if (tagSlug) {
    const targetTag = allTags.find((t) => t.slug === tagSlug);
    if (targetTag) {
      const linked = db
        .select({ postId: postTags.postId })
        .from(postTags)
        .where(eq(postTags.tagId, targetTag.id))
        .all();
      postIdsWithTag = linked.map((l) => l.postId);
      if (postIdsWithTag.length > 0) {
        conditions.push(sql`${posts.id} IN (${sql.join(postIdsWithTag.map((id) => sql`${id}`), sql`, `)})`);
      } else {
        // No posts with this tag
        conditions.push(sql`1 = 0`);
      }
    }
  }

  const whereClause = and(...conditions);

  // 5. Total count for current query
  const totalFilteredCount = db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(whereClause)
    .get()?.count || 0;

  const totalPages = Math.ceil(totalFilteredCount / POSTS_PER_PAGE);
  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  // 6. Query paginated posts
  const postList = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      pinned: posts.pinned,
      createdAt: posts.createdAt,
      viewCount: posts.viewCount,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(whereClause)
    .orderBy(desc(posts.pinned), desc(posts.createdAt))
    .limit(POSTS_PER_PAGE)
    .offset(offset)
    .all();

  // Helper to build page link preserving existing filters
  const buildPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categorySlug) params.set('category', categorySlug);
    if (tagSlug) params.set('tag', tagSlug);
    params.set('page', String(pageNumber));
    return `/blog?${params.toString()}`;
  };

  return (
    <div className="py-12 sm:py-16">
      <Container size="lg">
        {/* Header section */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0ece1]/70 dark:bg-[#1a1c22]/80 border border-[#e6e2d8] dark:border-[#2d313c] text-xs font-serif text-[#b83b3b] dark:text-[#d24e4e] mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              <span>墨海纪行 · 笔墨余香</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-wider text-[#1a1c23] dark:text-[#f3f4f6] mb-4">
              博文纪要
            </h1>
            <p className="text-sm sm:text-base font-serif text-[#4f566b] dark:text-[#9ca3af] leading-relaxed">
              梳理技术架构脉络，沉淀浮生片羽思索。计白当黑，于代码与文字间寻觅安宁。
            </p>
          </div>
        </ScrollReveal>

        {/* Search bar & filter controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          {/* Category filter pills */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            <Link
              href="/blog"
              className={`px-4 py-1.5 rounded-full text-xs font-serif font-medium transition-all ${
                !categorySlug && !tagSlug
                  ? 'bg-[#1a1c23] text-white dark:bg-[#f3f4f6] dark:text-[#121316] shadow-sm'
                  : 'bg-[#f0ece1]/70 text-[#4f566b] hover:bg-[#e6e2d8] hover:text-[#1a1c23] dark:bg-[#22252e] dark:text-[#9ca3af] dark:hover:bg-[#2d313c]'
              }`}
            >
              全部文章 ({totalPublishedPosts})
            </Link>

            {allCategories.map((cat) => {
              const active = categorySlug === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  className={`px-4 py-1.5 rounded-full text-xs font-serif font-medium transition-all ${
                    active
                      ? 'bg-[#b83b3b] text-white shadow-sm'
                      : 'bg-[#f0ece1]/70 text-[#4f566b] hover:bg-[#e6e2d8] hover:text-[#1a1c23] dark:bg-[#22252e] dark:text-[#9ca3af] dark:hover:bg-[#2d313c]'
                  }`}
                >
                  {cat.name} ({cat.postCount})
                </Link>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="w-full md:w-80">
            <SearchBar defaultValue={q || ''} placeholder="检索博文..." />
          </div>
        </div>

        {/* Tags bar if tags exist */}
        {allTags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-8 pb-4 border-b border-[#e6e2d8]/60 dark:border-[#2d313c]/60">
            <span className="text-xs text-[#6b7280] dark:text-[#9ca3af] font-serif mr-1">
              标签聚合:
            </span>
            {allTags.map((tag) => (
              <TagBadge
                key={tag.id}
                name={tag.name}
                href={`/blog?tag=${tag.slug}`}
                active={tagSlug === tag.slug}
                size="sm"
              />
            ))}
            {(q || categorySlug || tagSlug) && (
              <Link
                href="/blog"
                className="text-xs text-[#b83b3b] dark:text-[#d24e4e] hover:underline font-serif ml-2"
              >
                清空筛选
              </Link>
            )}
          </div>
        )}

        {/* Post Grid */}
        {postList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {postList.map((post, idx) => (
              <ScrollReveal key={post.id} direction="up" delay={idx * 0.05}>
                <ArticleCard
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  category={
                    post.categoryName && post.categorySlug
                      ? { name: post.categoryName, slug: post.categorySlug }
                      : null
                  }
                  date={post.createdAt}
                  pinned={Boolean(post.pinned)}
                />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 dark:bg-[#1a1c22]/40 border border-dashed border-[#e6e2d8] dark:border-[#2d313c] rounded-2xl my-8">
            <p className="text-base font-serif text-[#6b7280] dark:text-[#9ca3af] mb-4">
              未觅得相关笔墨文章。
            </p>
            <Link
              href="/blog"
              className="text-sm font-serif text-[#b83b3b] dark:text-[#d24e4e] hover:underline"
            >
              返回浏览全部文章
            </Link>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="p-2 rounded-lg border border-[#e6e2d8] dark:border-[#2d313c] text-[#4f566b] dark:text-[#9ca3af] hover:text-[#1a1c23] dark:hover:text-[#f3f4f6] hover:bg-[#f0ece1] dark:hover:bg-[#22252e] transition-colors"
                aria-label="上一页"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
            ) : (
              <span className="p-2 rounded-lg border border-[#e6e2d8]/40 dark:border-[#2d313c]/40 text-[#9ca3af]/40 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </span>
            )}

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const active = pageNum === currentPage;
                return (
                  <Link
                    key={pageNum}
                    href={buildPageUrl(pageNum)}
                    className={`w-9 h-9 rounded-lg font-serif text-xs font-medium flex items-center justify-center transition-all ${
                      active
                        ? 'bg-[#1a1c23] text-white dark:bg-[#f3f4f6] dark:text-[#121316] font-bold'
                        : 'text-[#4f566b] dark:text-[#9ca3af] hover:bg-[#f0ece1] dark:hover:bg-[#22252e] hover:text-[#1a1c23] dark:hover:text-[#f3f4f6]'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>

            {currentPage < totalPages ? (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="p-2 rounded-lg border border-[#e6e2d8] dark:border-[#2d313c] text-[#4f566b] dark:text-[#9ca3af] hover:text-[#1a1c23] dark:hover:text-[#f3f4f6] hover:bg-[#f0ece1] dark:hover:bg-[#22252e] transition-colors"
                aria-label="下一页"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="p-2 rounded-lg border border-[#e6e2d8]/40 dark:border-[#2d313c]/40 text-[#9ca3af]/40 cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
