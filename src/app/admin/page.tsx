import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { posts, bookmarks, downloads, categories } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { formatDate } from '@/lib/utils';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, PlusCircle, Settings, Eye, CheckCircle2, Compass, ArrowUpRight, Activity, Upload } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Query core statistics
  const totalPosts = db.select({ count: sql<number>`count(*)` }).from(posts).get()?.count || 0;
  const publishedPosts =
    db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.status, 'published'))
      .get()?.count || 0;
  const draftPosts = totalPosts - publishedPosts;
  const totalBookmarks = db.select({ count: sql<number>`count(*)` }).from(bookmarks).get()?.count || 0;
  const totalDownloads = db.select({ count: sql<number>`count(*)` }).from(downloads).get()?.count || 0;
  const totalViews =
    db.select({ sum: sql<number>`sum(${posts.viewCount})` }).from(posts).get()?.sum || 0;

  // Recent 5 posts
  const recentPosts = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      pinned: posts.pinned,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .orderBy(desc(posts.createdAt))
    .limit(5)
    .all();

  // Recent 4 downloads
  const recentDownloads = db
    .select({
      id: downloads.id,
      title: downloads.title,
      fileName: downloads.fileName,
      fileSize: downloads.fileSize,
      downloadCount: downloads.downloadCount,
      createdAt: downloads.createdAt,
    })
    .from(downloads)
    .orderBy(desc(downloads.createdAt))
    .limit(4)
    .all();

  // Recent 4 bookmarks
  const recentBookmarks = db
    .select({
      id: bookmarks.id,
      title: bookmarks.title,
      url: bookmarks.url,
      createdAt: bookmarks.createdAt,
    })
    .from(bookmarks)
    .orderBy(desc(bookmarks.createdAt))
    .limit(4)
    .all();

  // Combine into recent activity log
  const activityList = [
    ...recentPosts.map((p) => ({
      id: `post-${p.id}`,
      type: 'post' as const,
      title: `博文：${p.title}`,
      meta: p.status === 'published' ? '已发布' : '草稿保存',
      date: p.createdAt,
      href: `/admin/posts/${p.id}/edit`,
    })),
    ...recentBookmarks.map((b) => ({
      id: `bookmark-${b.id}`,
      type: 'bookmark' as const,
      title: `新增导航：${b.title}`,
      meta: b.url,
      date: b.createdAt,
      href: `/admin/bookmarks/${b.id}/edit`,
    })),
    ...recentDownloads.map((d) => ({
      id: `download-${d.id}`,
      type: 'download' as const,
      title: `上传资源：${d.title}`,
      meta: `${d.downloadCount || 0} 次下载`,
      date: d.createdAt,
      href: `/admin/downloads`,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const statsCards = [
    {
      title: '文章总数',
      value: totalPosts,
      subtext: `${publishedPosts} 篇已发布 · ${draftPosts} 篇草稿`,
      icon: FileText,
      href: '/admin/posts',
      color: 'text-[#1a1c23] dark:text-[#f3f4f6]',
      iconBg: 'bg-[#1a1c23]/10 dark:bg-[#f3f4f6]/10 text-[#1a1c23] dark:text-[#f3f4f6]',
    },
    {
      title: '已发布文章',
      value: publishedPosts,
      subtext: `累计浏览 ${totalViews} 次`,
      icon: CheckCircle2,
      href: '/admin/posts?status=published',
      color: 'text-[#b83b3b]',
      iconBg: 'bg-[#b83b3b]/10 text-[#b83b3b]',
    },
    {
      title: '导航站点',
      value: totalBookmarks,
      subtext: '精选工具与技术栈指引',
      icon: Compass,
      href: '/admin/bookmarks',
      color: 'text-[#2d3a4b] dark:text-[#93c5fd]',
      iconBg: 'bg-[#2d3a4b]/10 dark:bg-[#2d3a4b]/30 text-[#2d3a4b] dark:text-[#93c5fd]',
    },
    {
      title: '资源下载',
      value: totalDownloads,
      subtext: '开源代码与典藏资源',
      icon: Download,
      href: '/admin/downloads',
      color: 'text-[#4a6b5d] dark:text-[#86efac]',
      iconBg: 'bg-[#4a6b5d]/10 dark:bg-[#4a6b5d]/30 text-[#4a6b5d] dark:text-[#86efac]',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e6e2d8] pb-6 dark:border-[#2d313c]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1c23] dark:text-[#f3f4f6]">
            仪表盘概览
          </h1>
          <p className="mt-1 text-sm text-[#6b7280] dark:text-[#9ca3af]">
            掌管墨韵庭院内容、导航站与典藏文件，运墨五色，笔端万象。
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a1c23] px-3.5 py-2 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-[#272a34] dark:bg-[#f3f4f6] dark:text-[#121316] dark:hover:bg-[#e5e7eb] transition-all"
          >
            <PlusCircle className="h-4 w-4 text-[#b83b3b]" />
            <span>发布文章</span>
          </Link>
          <Link
            href="/admin/bookmarks/new"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#d1d5db] bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-[#1a1c23] shadow-xs hover:bg-[#faf8f5] dark:border-[#393e4f] dark:bg-[#1a1c22] dark:text-[#f3f4f6] dark:hover:bg-[#22252e] transition-all"
          >
            <Compass className="h-4 w-4 text-[#2d3a4b] dark:text-[#93c5fd]" />
            <span>添加导航</span>
          </Link>
          <Link
            href="/admin/downloads/new"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#d1d5db] bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-[#1a1c23] shadow-xs hover:bg-[#faf8f5] dark:border-[#393e4f] dark:bg-[#1a1c22] dark:text-[#f3f4f6] dark:hover:bg-[#22252e] transition-all"
          >
            <Upload className="h-4 w-4 text-[#4a6b5d] dark:text-[#86efac]" />
            <span>上传资源</span>
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#d1d5db] bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-[#1a1c23] shadow-xs hover:bg-[#faf8f5] dark:border-[#393e4f] dark:bg-[#1a1c22] dark:text-[#f3f4f6] dark:hover:bg-[#22252e] transition-all"
          >
            <Settings className="h-4 w-4 text-[#6b7280]" />
            <span>系统设置</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsCards.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href} className="group">
              <Card className="rounded-2xl border border-[#e6e2d8] p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#b83b3b]/40 dark:border-[#2d313c] dark:bg-[#1a1c22]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#6b7280] dark:text-[#9ca3af]">
                    {item.title}
                  </span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className={`mt-3 text-3xl font-bold font-serif ${item.color}`}>
                  {item.value}
                </div>
                <p className="mt-1 text-xs text-[#6b7280] dark:text-[#9ca3af] truncate">
                  {item.subtext}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Recent Posts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Posts (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-2xl border border-[#e6e2d8] p-6 shadow-xs dark:border-[#2d313c] dark:bg-[#1a1c22]">
            <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-4 dark:border-[#2d313c]">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#b83b3b]" />
                <CardTitle className="font-serif text-lg font-bold">近期博文</CardTitle>
              </div>
              <Link
                href="/admin/posts"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#b83b3b] hover:underline"
              >
                <span>查看全部文章</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#e6e2d8]/60 dark:divide-[#2d313c]/60">
              {recentPosts.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#6b7280] dark:text-[#9ca3af]">
                  暂无文章，点击“发布文章”开始创作
                </div>
              ) : (
                recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 hover:bg-[#faf8f5] dark:hover:bg-[#22252e]/50 px-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {post.pinned && (
                          <span className="rounded bg-[#b83b3b]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#b83b3b]">
                            置顶
                          </span>
                        )}
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="font-medium text-sm text-[#1a1c23] hover:text-[#b83b3b] dark:text-[#f3f4f6] dark:hover:text-[#d24e4e] truncate block"
                        >
                          {post.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#6b7280] dark:text-[#9ca3af]">
                        <span>{post.categoryName || '未分类'}</span>
                        <span>·</span>
                        <span>{formatDate(post.createdAt)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.viewCount || 0}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <Badge
                        variant={post.status === 'published' ? 'default' : 'secondary'}
                        className="text-[11px] capitalize"
                      >
                        {post.status === 'published' ? '已发布' : '草稿'}
                      </Badge>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="rounded-lg border border-[#d1d5db] px-2.5 py-1 text-xs font-medium text-[#1a1c23] hover:bg-[#e6e2d8] dark:border-[#393e4f] dark:text-[#f3f4f6] dark:hover:bg-[#272a34] transition-colors"
                      >
                        编辑
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Recent Activity Log (1 col on large screen) */}
        <div className="space-y-4">
          <Card className="rounded-2xl border border-[#e6e2d8] p-6 shadow-xs dark:border-[#2d313c] dark:bg-[#1a1c22]">
            <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-4 dark:border-[#2d313c]">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#b83b3b]" />
                <CardTitle className="font-serif text-lg font-bold">系统动态</CardTitle>
              </div>
              <span className="text-[11px] font-mono text-[#6b7280] dark:text-[#9ca3af]">
                实时记录
              </span>
            </div>

            <div className="relative mt-4 space-y-4">
              {activityList.length === 0 ? (
                <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">暂无动态</p>
              ) : (
                activityList.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start group">
                    <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-[#b83b3b]" />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={item.href}
                        className="text-xs font-medium text-[#1a1c23] hover:text-[#b83b3b] dark:text-[#f3f4f6] dark:hover:text-[#d24e4e] block truncate"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-center justify-between mt-0.5 text-[11px] text-[#6b7280] dark:text-[#9ca3af]">
                        <span className="truncate max-w-[140px]">{item.meta}</span>
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
