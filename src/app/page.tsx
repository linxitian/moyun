import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Compass, Download } from 'lucide-react';
import { db } from '@/lib/db';
import { posts, categories, bookmarks, bookmarkCategories, downloads } from '@/lib/db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { Container } from '@/components/layout/Container';
import { SealStamp } from '@/components/ui/SealStamp';
import { InkDivider } from '@/components/ui/InkDivider';
import { InkButton } from '@/components/ui/InkButton';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { BookmarkCard } from '@/components/ui/BookmarkCard';
import { DownloadCard } from '@/components/ui/DownloadCard';
import { InkBackground } from '@/components/ui/InkBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { isDownloadAvailable } from '@/lib/uploads';
import { getSiteSettings } from '@/lib/settings';

export const revalidate = 0; // dynamic on demand

export default async function HomePage() {
  const site = getSiteSettings();
  // 1. Fetch latest published posts
  const latestPosts = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      pinned: posts.pinned,
      createdAt: posts.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.pinned), desc(posts.createdAt))
    .limit(6)
    .all();

  // 2. Fetch featured bookmarks
  const featuredBookmarks = db
    .select({
      id: bookmarks.id,
      title: bookmarks.title,
      url: bookmarks.url,
      description: bookmarks.description,
      icon: bookmarks.icon,
      categoryName: bookmarkCategories.name,
    })
    .from(bookmarks)
    .leftJoin(bookmarkCategories, eq(bookmarks.categoryId, bookmarkCategories.id))
    .orderBy(asc(bookmarks.sortOrder), desc(bookmarks.createdAt))
    .limit(6)
    .all();

  // 3. Fetch latest downloads
  const latestDownloads = db
    .select()
    .from(downloads)
    .orderBy(desc(downloads.createdAt))
    .limit(4)
    .all();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center py-20 overflow-hidden">
        <InkBackground />

        <Container size="lg" className="relative z-10 text-center flex flex-col items-center">
          <ScrollReveal direction="down" delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f0ece1]/70 dark:bg-[#1a1c22]/80 border border-[#e6e2d8] dark:border-[#2d313c] text-xs font-serif text-[#6b7280] dark:text-[#9ca3af] mb-8 backdrop-blur-sm">
              <SealStamp size="xs" text="韵" rotate={false} />
              <span>{site.siteSubtitle}</span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <div className="relative mb-6">
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-serif font-black tracking-widest text-[#1a1c23] dark:text-[#f3f4f6]">
                {site.siteName.slice(0, -1)}<span className="text-[#b83b3b] dark:text-[#d24e4e]">{site.siteName.slice(-1)}</span>
              </h1>
              <span className="block mt-4 text-xs sm:text-sm font-serif tracking-[0.3em] uppercase text-[#6b7280] dark:text-[#9ca3af]">
                MoYun · Digital Garden
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.3}>
            <p className="max-w-xl text-base sm:text-lg text-[#4f566b] dark:text-[#9ca3af] font-serif leading-relaxed mb-10 mx-auto">
              “运墨而五色具，计白当黑。”
              <br />
              {site.siteDescription}
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <InkButton
                href="/blog"
                variant="primary"
                size="lg"
                icon={<BookOpen className="w-4 h-4" />}
              >
                品读文章
              </InkButton>
              <InkButton
                href="/nav"
                variant="secondary"
                size="lg"
                icon={<Compass className="w-4 h-4" />}
              >
                精选导航
              </InkButton>
              <InkButton
                href="/archive"
                variant="ghost"
                size="lg"
                icon={<Download className="w-4 h-4" />}
              >
                典藏下载
              </InkButton>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      <Container size="lg">
        {/* Section 1: Latest Posts */}
        <section className="py-12 sm:py-16">
          <ScrollReveal direction="up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-serif tracking-widest uppercase text-[#b83b3b] dark:text-[#d24e4e] mb-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#b83b3b]" />
                  Latest Articles
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1a1c23] dark:text-[#f3f4f6]">
                  最新文章
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-serif font-medium text-[#4f566b] dark:text-[#9ca3af] hover:text-[#b83b3b] dark:hover:text-[#d24e4e] transition-colors"
              >
                <span>浏览全部文章</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>

          {latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post, idx) => (
                <ScrollReveal key={post.id} direction="up" delay={idx * 0.1}>
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
            <div className="text-center py-16 text-[#6b7280] dark:text-[#9ca3af] font-serif border border-dashed border-[#e6e2d8] dark:border-[#2d313c] rounded-2xl">
              墨池方干，暂无文章发布。
            </div>
          )}
        </section>

        <InkDivider text="沉淀 · 见微" />

        {/* Section 2: Featured Links */}
        <section className="py-12 sm:py-16">
          <ScrollReveal direction="up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-serif tracking-widest uppercase text-[#2d3a4b] dark:text-[#90caf9] mb-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#2d3a4b]" />
                  Curated Bookmarks
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1a1c23] dark:text-[#f3f4f6]">
                  精选导航
                </h2>
              </div>
              <Link
                href="/nav"
                className="inline-flex items-center gap-1.5 text-sm font-serif font-medium text-[#4f566b] dark:text-[#9ca3af] hover:text-[#b83b3b] dark:hover:text-[#d24e4e] transition-colors"
              >
                <span>查看所有链接</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>

          {featuredBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBookmarks.map((bookmark, idx) => (
                <ScrollReveal key={bookmark.id} direction="up" delay={idx * 0.08}>
                  <BookmarkCard
                    title={bookmark.title}
                    url={bookmark.url}
                    description={bookmark.description}
                    icon={bookmark.icon}
                    categoryName={bookmark.categoryName}
                  />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#6b7280] dark:text-[#9ca3af] font-serif border border-dashed border-[#e6e2d8] dark:border-[#2d313c] rounded-2xl">
              暂未收录书签。
            </div>
          )}
        </section>

        <InkDivider text="墨宝 · 藏典" />

        {/* Section 3: Downloads */}
        <section className="py-12 sm:py-16 mb-12">
          <ScrollReveal direction="up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-serif tracking-widest uppercase text-[#4a6b5d] dark:text-[#a5d6a7] mb-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#4a6b5d]" />
                  Digital Archives
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1a1c23] dark:text-[#f3f4f6]">
                  作品下载
                </h2>
              </div>
              <Link
                href="/archive"
                className="inline-flex items-center gap-1.5 text-sm font-serif font-medium text-[#4f566b] dark:text-[#9ca3af] hover:text-[#b83b3b] dark:hover:text-[#d24e4e] transition-colors"
              >
                <span>进入档案馆</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>

          {latestDownloads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestDownloads.map((dl, idx) => (
                <ScrollReveal key={dl.id} direction="up" delay={idx * 0.1}>
                  <DownloadCard
                    available={isDownloadAvailable(dl.filePath)}
                    id={dl.id}
                    title={dl.title}
                    description={dl.description}
                    fileName={dl.fileName}
                    filePath={dl.filePath}
                    fileSize={dl.fileSize}
                    fileType={dl.fileType}
                    category={dl.category}
                    downloadCount={dl.downloadCount}
                    createdAt={dl.createdAt}
                  />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#6b7280] dark:text-[#9ca3af] font-serif border border-dashed border-[#e6e2d8] dark:border-[#2d313c] rounded-2xl">
              暂无开放下载作品。
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}
