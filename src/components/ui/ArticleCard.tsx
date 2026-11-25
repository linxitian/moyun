import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, Pin, ArrowRight } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { PaperCard } from './PaperCard';

export interface ArticleCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | { name: string; slug: string } | null;
  date: string | Date;
  readingTime?: number | string;
  coverImage?: string | null;
  pinned?: boolean | null;
  className?: string;
}

export function ArticleCard({
  title,
  slug,
  excerpt,
  category,
  date,
  readingTime,
  pinned,
  className,
}: ArticleCardProps) {
  const categoryName = typeof category === 'string' ? category : category?.name;
  const categorySlug = typeof category === 'object' && category ? category.slug : undefined;

  const readingTimeText =
    typeof readingTime === 'number'
      ? `${readingTime} 分钟阅读`
      : readingTime || '3 分钟阅读';

  return (
    <PaperCard
      hoverEffect={true}
      className={cn('group flex flex-col justify-between h-full p-6 transition-all', className)}
    >
      <div>
        {/* Header row: Category & Pin indicator */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {categoryName ? (
            categorySlug ? (
              <Link
                href={`/blog?category=${categorySlug}`}
                className="text-xs font-serif font-medium text-[#b83b3b] dark:text-[#d24e4e] bg-[#b83b3b]/10 dark:bg-[#b83b3b]/20 px-2.5 py-0.5 rounded-full hover:bg-[#b83b3b]/20 transition-colors"
              >
                {categoryName}
              </Link>
            ) : (
              <span className="text-xs font-serif font-medium text-[#b83b3b] dark:text-[#d24e4e] bg-[#b83b3b]/10 dark:bg-[#b83b3b]/20 px-2.5 py-0.5 rounded-full">
                {categoryName}
              </span>
            )
          ) : (
            <span className="text-xs font-serif text-[#6b7280]">随笔</span>
          )}

          {pinned && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#b83b3b] dark:text-[#d24e4e] bg-[#f5f2eb] dark:bg-[#22252e] px-2 py-0.5 rounded-md border border-[#e6e2d8] dark:border-[#2d313c]">
              <Pin className="w-3 h-3 rotate-45 fill-current" />
              <span>置顶</span>
            </span>
          )}
        </div>

        {/* Article Title */}
        <h3 className="text-xl font-serif font-bold text-[#1a1c23] dark:text-[#f3f4f6] group-hover:text-[#b83b3b] dark:group-hover:text-[#d24e4e] transition-colors leading-snug mb-3">
          <Link href={`/blog/${slug}`} className="focus:outline-none focus:underline">
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-[#4f566b] dark:text-[#9ca3af] line-clamp-3 leading-relaxed mb-6 font-sans">
            {excerpt}
          </p>
        )}
      </div>

      {/* Footer metadata */}
      <div className="pt-4 border-t border-[#e6e2d8]/60 dark:border-[#2d313c]/60 flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            <time dateTime={typeof date === 'string' ? date : date.toISOString()}>
              {formatDate(date)}
            </time>
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 opacity-70" />
            <span>{readingTimeText}</span>
          </span>
        </div>

        <Link
          href={`/blog/${slug}`}
          className="inline-flex items-center gap-1 text-[#1a1c23] dark:text-[#f3f4f6] font-medium group-hover:text-[#b83b3b] dark:group-hover:text-[#d24e4e] transition-colors"
          aria-label={`阅读全文: ${title}`}
        >
          <span>品读</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </PaperCard>
  );
}

export default ArticleCard;
