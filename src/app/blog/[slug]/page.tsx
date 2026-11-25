import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { posts, categories, tags, postTags } from '@/lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { ArrowLeft, Calendar, Clock, Eye, BookOpen } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { ReadingProgress } from '@/components/ui/ReadingProgress';
import { SealStamp } from '@/components/ui/SealStamp';
import { TagBadge } from '@/components/ui/TagBadge';
import { InkDivider } from '@/components/ui/InkDivider';
import { formatDate, calculateReadingTime, slugify } from '@/lib/utils';
import { CopyButton } from './CopyButton';
import { getSiteSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = db
    .select({
      title: posts.title,
      excerpt: posts.excerpt,
    })
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, 'published')))
    .get();

  if (!post) {
    return {
      title: '文章未找到',
    };
  }

  return {
    title: post.title,
    description: post.excerpt || `${post.title} - ${getSiteSettings().siteName}文章纪要`,
  };
}

// Helper to extract table of contents from markdown source
function extractHeadings(markdown: string) {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { level: number; text: string; id: string }[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim().replace(/[*`_]/g, '');
    const id = slugify(text);
    headings.push({ level, text, id });
  }

  return headings;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const site = getSiteSettings();
  const { slug } = await params;

  // 1. Fetch post by slug with category
  const post = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      content: posts.content,
      excerpt: posts.excerpt,
      coverImage: posts.coverImage,
      pinned: posts.pinned,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.slug, slug), eq(posts.status, 'published')))
    .get();

  if (!post) {
    notFound();
  }

  // 2. Increment view count asynchronously
  try {
    db.update(posts)
      .set({ viewCount: sql`${posts.viewCount} + 1` })
      .where(eq(posts.id, post.id))
      .run();
  } catch (err) {
    console.error('Failed to update post viewCount:', err);
  }

  // 3. Fetch tags for this post
  const postTagList = db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, post.id))
    .all();

  // 4. Calculate reading time and extract TOC
  const readingTime = calculateReadingTime(post.content);
  const headings = extractHeadings(post.content);

  // 5. Compile MDX content
  const { content: mdxContent } = await compileMDX({
    source: post.content,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, rehypeHighlight],
      },
    },
  });

  return (
    <article className="py-10 sm:py-14 min-h-screen">
      {/* Scroll Reading Progress Bar */}
      <ReadingProgress />

      <Container size="lg">
        {/* Back navigation & Category breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#e6e2d8]/60 dark:border-[#2d313c]/60">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-serif text-[#4f566b] dark:text-[#9ca3af] hover:text-[#b83b3b] dark:hover:text-[#d24e4e] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回博文列表</span>
          </Link>

          {post.categoryName && post.categorySlug && (
            <Link
              href={`/blog?category=${post.categorySlug}`}
              className="text-xs font-serif font-medium text-[#b83b3b] dark:text-[#d24e4e] bg-[#b83b3b]/10 dark:bg-[#b83b3b]/20 px-3 py-1 rounded-full hover:bg-[#b83b3b]/20 transition-colors"
            >
              {post.categoryName}
            </Link>
          )}
        </div>

        {/* Article Header */}
        <header className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-[#1a1c23] dark:text-[#f3f4f6] leading-tight mb-6">
            {post.title}
          </h1>

          {/* Meta Info Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#6b7280] dark:text-[#9ca3af] font-serif">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 opacity-70" />
              <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 opacity-70" />
              <span>约 {readingTime} 分钟品读</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 opacity-70" />
              <span>{(post.viewCount ?? 0) + 1} 次阅览</span>
            </span>
          </div>

          {/* Tags */}
          {postTagList.length > 0 && (
            <div className="flex items-center justify-center flex-wrap gap-2 mt-5">
              {postTagList.map((tag) => (
                <TagBadge
                  key={tag.id}
                  name={tag.name}
                  href={`/blog?tag=${tag.slug}`}
                  size="sm"
                />
              ))}
            </div>
          )}
        </header>

        <InkDivider width="max-w-3xl mx-auto" />

        {/* Main layout: Table of contents sidebar (if available) + Article body */}
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12 mt-8">
          {/* Article Body */}
          <div className="flex-1 min-w-0 max-w-3xl mx-auto">
            <div className="prose-ink dark:text-zinc-200">
              {mdxContent}
            </div>

            {/* Post signature / Seal stamp footer */}
            <div className="mt-16 pt-8 border-t border-[#e6e2d8] dark:border-[#2d313c] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <SealStamp size="md" text={site.authorName.slice(0, 1)} />
                <div>
                  <div className="font-serif font-bold text-sm text-[#1a1c23] dark:text-[#f3f4f6]">
                    {site.authorName} · 笔耕留白
                  </div>
                  <div className="text-xs text-[#6b7280] dark:text-[#9ca3af] font-serif mt-0.5">
                    写于数字庭院，以水墨寄情
                  </div>
                </div>
              </div>

              <CopyButton />
            </div>
          </div>

          {/* Table of contents sidebar on large screens */}
          {headings.length > 0 && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28 p-5 rounded-xl border border-[#e6e2d8] dark:border-[#2d313c] bg-[#ffffff]/60 dark:bg-[#1a1c22]/60 backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#1a1c23] dark:text-[#f3f4f6] pb-3 mb-3 border-b border-[#e6e2d8]/60 dark:border-[#2d313c]/60">
                  <BookOpen className="w-4 h-4 text-[#b83b3b]" />
                  <span>文章目录</span>
                </div>
                <nav className="space-y-2 text-xs font-serif max-h-[calc(100vh-200px)] overflow-y-auto">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className={`block py-1 text-[#4f566b] dark:text-[#9ca3af] hover:text-[#b83b3b] dark:hover:text-[#d24e4e] transition-colors leading-snug ${
                        h.level === 3 ? 'pl-3 text-[11px] opacity-85' : 'font-medium'
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </Container>
    </article>
  );
}
