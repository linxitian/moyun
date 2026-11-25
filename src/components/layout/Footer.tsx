'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from './Container';
import { MountainSilhouette } from '@/components/ui/MountainSilhouette';
import { SealStamp } from '@/components/ui/SealStamp';
import type { SiteSettings } from '@/lib/settings';

export function Footer({ site }: { site: SiteSettings }) {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="relative mt-auto border-t border-[#e6e2d8] dark:border-[#2d313c] bg-[#f5f2eb]/60 dark:bg-[#16181f]/60 overflow-hidden">
      {/* Mountain silhouette background positioned at the top of footer */}
      <MountainSilhouette height={120} opacity={0.4} className="absolute bottom-0 left-0 right-0" />

      <Container size="lg" className="relative z-10 pt-12 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Motto */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <SealStamp size="sm" text={site.siteName.slice(0, 1)} />
              <span className="font-serif font-black text-xl text-[#1a1c23] dark:text-[#f3f4f6] tracking-wider">
                {site.siteName}
              </span>
            </div>
            <p className="text-sm text-[#4f566b] dark:text-[#9ca3af] max-w-md leading-relaxed font-sans">
              {site.siteDescription}
            </p>
            <div className="text-xs font-serif italic text-[#6b7280] dark:text-[#9ca3af]">
              “运墨而五色具，计白当黑，笔端起波澜，纸上有烟云。”
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#1a1c23] dark:text-[#f3f4f6]">
              快速导览
            </h4>
            <ul className="space-y-2 text-xs text-[#4f566b] dark:text-[#9ca3af] font-serif">
              <li>
                <Link href="/" className="hover:text-[#b83b3b] dark:hover:text-[#d24e4e] transition-colors">
                  庭院首页
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#b83b3b] dark:hover:text-[#d24e4e] transition-colors">
                  博文纪要
                </Link>
              </li>
              <li>
                <Link href="/nav" className="hover:text-[#b83b3b] dark:hover:text-[#d24e4e] transition-colors">
                  精选指引
                </Link>
              </li>
              <li>
                <Link href="/archive" className="hover:text-[#b83b3b] dark:hover:text-[#d24e4e] transition-colors">
                  典藏下载
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#b83b3b] dark:hover:text-[#d24e4e] transition-colors">
                  关于主人
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect / Info */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#1a1c23] dark:text-[#f3f4f6]">
              数字足迹
            </h4>
            <ul className="space-y-2 text-xs text-[#4f566b] dark:text-[#9ca3af] font-serif">
              {site.githubUrl && <li>
                <a
                  href={site.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#b83b3b] dark:hover:text-[#d24e4e] transition-colors"
                >
                  GitHub 代码仓
                </a>
              </li>}
              <li>
                <Link href="/admin" className="hover:text-[#b83b3b] dark:hover:text-[#d24e4e] transition-colors">
                  馆长登入
                </Link>
              </li>
              <li>
                <span className="text-[#9ca3af] dark:text-[#6b7280]">
                  采用 Next.js 16 & Tailwind 4
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-[#e6e2d8]/60 dark:border-[#2d313c]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6b7280] dark:text-[#9ca3af]">
          <div>
            {site.footerText || `© ${currentYear} ${site.siteName}. ${site.siteSubtitle}`}
          </div>
          {site.icp && <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] opacity-75">{site.icp}</a>}
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
