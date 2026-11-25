import React from 'react';
import { isDownloadAvailable } from '@/lib/uploads';
import Link from 'next/link';
import { Archive } from 'lucide-react';
import { db } from '@/lib/db';
import { downloads } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { Container } from '@/components/layout/Container';
import { DownloadCard } from '@/components/ui/DownloadCard';
import { SearchBar } from '@/components/ui/SearchBar';

import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const revalidate = 0;

interface ArchivePageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const { category: selectedCategory, q } = await searchParams;

  // 1. Fetch all downloads
  const allDownloads = db
    .select()
    .from(downloads)
    .orderBy(desc(downloads.createdAt))
    .all();

  // Extract unique categories
  const categoriesSet = new Set<string>();
  allDownloads.forEach((d) => {
    if (d.category) {
      categoriesSet.add(d.category);
    }
  });
  const categoryList = Array.from(categoriesSet);

  // Filter downloads
  let filteredList = allDownloads;
  if (selectedCategory) {
    filteredList = filteredList.filter((d) => d.category === selectedCategory);
  }
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    filteredList = filteredList.filter(
      (d) =>
        d.title.toLowerCase().includes(term) ||
        (d.description && d.description.toLowerCase().includes(term)) ||
        d.fileName.toLowerCase().includes(term)
    );
  }

  // Calculate total download counts
  const totalDownloadsCount = allDownloads.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);

  return (
    <div className="py-12 sm:py-16">
      <Container size="lg">
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0ece1]/70 dark:bg-[#1a1c22]/80 border border-[#e6e2d8] dark:border-[#2d313c] text-xs font-serif text-[#4a6b5d] dark:text-[#a5d6a7] mb-4">
              <Archive className="w-3.5 h-3.5" />
              <span>墨宝藏典 · 自由取阅</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-wider text-[#1a1c23] dark:text-[#f3f4f6] mb-4">
              档案馆
            </h1>
            <p className="text-sm sm:text-base font-serif text-[#4f566b] dark:text-[#9ca3af] leading-relaxed">
              沉淀高质量原创壁纸、设计规范白皮书与工具模板。免费取阅，传续精神。
            </p>
          </div>
        </ScrollReveal>

        {/* Stats counter strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 max-w-xl mx-auto mb-10 p-4 rounded-2xl bg-[#ffffff]/60 dark:bg-[#1a1c22]/60 border border-[#e6e2d8] dark:border-[#2d313c] backdrop-blur-sm text-center">
          <div className="p-2 border-r border-[#e6e2d8]/60 dark:border-[#2d313c]/60">
            <div className="text-2xl font-serif font-bold text-[#1a1c23] dark:text-[#f3f4f6]">
              {allDownloads.length}
            </div>
            <div className="text-xs font-serif text-[#6b7280] dark:text-[#9ca3af] mt-1">
              典藏项目
            </div>
          </div>
          <div className="p-2 sm:border-r border-[#e6e2d8]/60 dark:border-[#2d313c]/60">
            <div className="text-2xl font-serif font-bold text-[#b83b3b] dark:text-[#d24e4e]">
              {totalDownloadsCount}
            </div>
            <div className="text-xs font-serif text-[#6b7280] dark:text-[#9ca3af] mt-1">
              累计取阅
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 p-2 mt-2 sm:mt-0 pt-2 border-t sm:border-t-0 border-[#e6e2d8]/60 dark:border-[#2d313c]/60">
            <div className="text-2xl font-serif font-bold text-[#4a6b5d] dark:text-[#a5d6a7]">
              100%
            </div>
            <div className="text-xs font-serif text-[#6b7280] dark:text-[#9ca3af] mt-1">
              开源共享
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            <Link
              href="/archive"
              className={`px-4 py-1.5 rounded-full text-xs font-serif font-medium transition-all ${
                !selectedCategory
                  ? 'bg-[#1a1c23] text-white dark:bg-[#f3f4f6] dark:text-[#121316] shadow-sm'
                  : 'bg-[#f0ece1]/70 text-[#4f566b] hover:bg-[#e6e2d8] hover:text-[#1a1c23] dark:bg-[#22252e] dark:text-[#9ca3af] dark:hover:bg-[#2d313c]'
              }`}
            >
              全部作品 ({allDownloads.length})
            </Link>

            {categoryList.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <Link
                  key={cat}
                  href={`/archive?category=${encodeURIComponent(cat)}`}
                  className={`px-4 py-1.5 rounded-full text-xs font-serif font-medium transition-all ${
                    active
                      ? 'bg-[#4a6b5d] text-white shadow-sm'
                      : 'bg-[#f0ece1]/70 text-[#4f566b] hover:bg-[#e6e2d8] hover:text-[#1a1c23] dark:bg-[#22252e] dark:text-[#9ca3af] dark:hover:bg-[#2d313c]'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          <div className="w-full md:w-80">
            <SearchBar defaultValue={q || ''} placeholder="检索档案项目..." />
          </div>
        </div>

        {/* Downloads Grid */}
        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {filteredList.map((item, idx) => (
              <ScrollReveal key={item.id} direction="up" delay={idx * 0.08}>
                <DownloadCard
                  available={isDownloadAvailable(item.filePath)}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  fileName={item.fileName}
                  filePath={item.filePath}
                  fileSize={item.fileSize}
                  fileType={item.fileType}
                  category={item.category}
                  downloadCount={item.downloadCount}
                  createdAt={item.createdAt}
                />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 dark:bg-[#1a1c22]/40 border border-dashed border-[#e6e2d8] dark:border-[#2d313c] rounded-2xl">
            <p className="text-base font-serif text-[#6b7280] dark:text-[#9ca3af] mb-4">
              暂未收录相关档案或下载项。
            </p>
            <Link
              href="/archive"
              className="text-sm font-serif text-[#b83b3b] dark:text-[#d24e4e] hover:underline"
            >
              查看全部档案
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
