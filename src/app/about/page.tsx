import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Mail, BookOpen, Feather, Compass } from 'lucide-react';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { defaultSiteSettings, getSiteSettings } from '@/lib/settings';
import { Container } from '@/components/layout/Container';
import { PaperCard } from '@/components/ui/PaperCard';
import { SealStamp } from '@/components/ui/SealStamp';
import { InkDivider } from '@/components/ui/InkDivider';
import { InkButton } from '@/components/ui/InkButton';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteSettings();
  return {
    title: `关于${site.authorName}`,
    description: `${site.authorName}的个人介绍，写在${site.siteName}的字里行间。`,
  };
}

export default function AboutPage() {
  const site = getSiteSettings();
  const settingsMap = new Map(db.select().from(settings).all().map((item) => [item.key, item.value]));
  const authorName = site.authorName;
  const authorBio = settingsMap.get('authorBio') || defaultSiteSettings.authorBio;
  const avatar = settingsMap.get('avatar');
  const aboutContent = settingsMap.get('aboutContent')?.trim();
  const email = settingsMap.get('email')?.trim();
  const githubUrl = site.githubUrl || 'https://github.com';

  const introductions = [
    {
      label: '初识',
      title: `我是${authorName}`,
      icon: User,
      paragraphs: [
        `「${site.siteName}」的主人，也是这个小站的记录者。`,
        '把想说的话写下来，把想留住的片段慢慢收好。这里是我的一方小天地，也欢迎你来坐坐。',
      ],
    },
    {
      label: '所记',
      title: '所思与所记',
      icon: BookOpen,
      paragraphs: [
        '在文字中整理思绪，在尝试中留下痕迹。',
        '这里会收下我的文章、作品，以及那些值得再次打开的链接。愿每次回望，都能看到一点新的自己。',
      ],
    },
    {
      label: '所爱',
      title: '偏爱简单与留白',
      icon: Feather,
      paragraphs: [
        '喜欢纸墨的温润，也喜欢留白的从容。',
        '希望这里安静、清楚，有自己的节奏。少一些繁复的装饰，多一些可以慢慢读下去的内容。',
      ],
    },
  ];

  const philosophies = [
    {
      title: '计白当黑',
      english: 'Negative Space',
      text: '不急着填满每一寸空间。留一点空白，给文字，也给读到这里的你。',
    },
    {
      title: '运墨五色',
      english: 'Subtle Contrast',
      text: '以纸白为底，以墨色铺陈，偶有一抹朱砂。颜色克制一些，内容便清楚一些。',
    },
    {
      title: '笔走龙蛇',
      english: 'A Natural Rhythm',
      text: '书写有自己的节奏，阅读也应当从容。愿每一次翻页，都像展开一张熟悉的纸。',
    },
  ];

  return (
    <div className="py-12 sm:py-16">
      <Container size="lg">
        <section aria-labelledby="about-owner" className="mb-12 sm:mb-16">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 max-w-4xl mx-auto">
            <ScrollReveal direction="right" delay={0.1}>
              <div className="relative">
                {avatar && avatar !== '/avatar.png' ? (
                  <Image src={avatar} alt={`${authorName}的头像`} width={112} height={112} unoptimized className="w-28 h-28 rounded-xl object-cover shadow-sm" />
                ) : (
                  <SealStamp size="xl" text={authorName.slice(0, 1)} rotate={false} />
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.15} className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0ece1]/70 dark:bg-[#1a1c22]/80 border border-[#e6e2d8] dark:border-[#2d313c] text-xs font-serif text-[#b83b3b] dark:text-[#d24e4e] mb-4">
                <User className="w-3.5 h-3.5" aria-hidden="true" />
                <span>关于主人 · 初识{authorName}</span>
              </div>
              <h1 id="about-owner" className="text-3xl sm:text-4xl font-serif font-black text-[#1a1c23] dark:text-[#f3f4f6] mb-4">
                你好，我是{authorName}
              </h1>
              <p className="text-sm sm:text-base text-[#4f566b] dark:text-[#9ca3af] font-serif leading-loose mb-6 max-w-xl">
                {authorBio}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <InkButton href="/blog" variant="primary" size="sm" icon={<BookOpen className="w-3.5 h-3.5" />}>
                  读我的文字
                </InkButton>
                {email && (
                  <InkButton href={`mailto:${email}`} variant="secondary" size="sm" icon={<Mail className="w-3.5 h-3.5" />}>
                    写信予我
                  </InkButton>
                )}
                {githubUrl && (
                  <InkButton href={githubUrl} target="_blank" rel="noopener noreferrer" variant="ghost" size="sm" icon={<GithubIcon className="w-3.5 h-3.5" />}>
                    GitHub
                  </InkButton>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <InkDivider text="字里行间 · 认识一下" />

        <section id="personal-introduction" aria-labelledby="personal-introduction-heading" className="py-8 mb-12 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 id="personal-introduction-heading" className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1c23] dark:text-[#f3f4f6]">
              关于我
            </h2>
            <p className="text-xs sm:text-sm font-serif text-[#6b7280] dark:text-[#9ca3af] mt-3 leading-relaxed">
              一点自述，一些所爱，都写在墨韵里
            </p>
          </div>

          {aboutContent ? (
            <PaperCard hoverEffect={false} className="p-6 sm:p-8 max-w-3xl mx-auto">
              <div className="prose-ink text-base max-w-none">
                <Markdown remarkPlugins={[remarkGfm]} skipHtml>{aboutContent}</Markdown>
              </div>
            </PaperCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {introductions.map((introduction, index) => {
                const Icon = introduction.icon;
                return (
                  <ScrollReveal key={introduction.label} direction="up" delay={index * 0.08} className="h-full">
                    <PaperCard className="p-6 h-full">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 rounded-lg bg-[#f0ece1] dark:bg-[#22252e] text-[#b83b3b] dark:text-[#d24e4e]">
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div>
                          <span className="block text-[10px] font-serif tracking-[0.2em] text-[#6b7280] dark:text-[#9ca3af] mb-1">{introduction.label}</span>
                          <h3 className="font-serif font-bold text-base text-[#1a1c23] dark:text-[#f3f4f6]">{introduction.title}</h3>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm font-serif leading-loose text-[#4f566b] dark:text-[#9ca3af]">
                        {introduction.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                      </div>
                    </PaperCard>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </section>

        <InkDivider text="墨韵之间 · 留一点白" />

        <section aria-labelledby="personal-style-heading" className="py-8 mb-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 id="personal-style-heading" className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1c23] dark:text-[#f3f4f6]">我的一点偏爱</h2>
            <p className="text-xs sm:text-sm font-serif text-[#6b7280] dark:text-[#9ca3af] mt-3 leading-relaxed">也是这个小站一直想保留的样子</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {philosophies.map((philosophy, index) => (
              <ScrollReveal key={philosophy.title} direction="up" delay={index * 0.08} className="h-full">
                <PaperCard className="p-6 h-full">
                  <div className="text-[10px] font-mono tracking-widest text-[#b83b3b] dark:text-[#d24e4e] uppercase mb-2">{philosophy.english}</div>
                  <h3 className="text-xl font-serif font-bold text-[#1a1c23] dark:text-[#f3f4f6] mb-4">{philosophy.title}</h3>
                  <p className="text-sm font-serif leading-loose text-[#4f566b] dark:text-[#9ca3af]">{philosophy.text}</p>
                </PaperCard>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <ScrollReveal direction="up">
          <PaperCard hoverEffect={false} className="max-w-2xl mx-auto text-center p-8 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1c23] dark:text-[#f3f4f6] mb-4">山海相逢，幸会于此</h2>
            <p className="text-sm font-serif text-[#4f566b] dark:text-[#9ca3af] mb-6 leading-loose">既然来了，就随意翻翻。愿这里的一段文字、一次分享，能与你偶然相逢。</p>
            <div className="flex flex-wrap justify-center gap-3">
              <InkButton href="/blog" variant="primary" size="sm" icon={<BookOpen className="w-3.5 h-3.5" />}>翻翻文章</InkButton>
              {email ? (
                <InkButton href={`mailto:${email}`} variant="secondary" size="sm" icon={<Mail className="w-3.5 h-3.5" />}>写信予我</InkButton>
              ) : (
                <InkButton href="/nav" variant="secondary" size="sm" icon={<Compass className="w-3.5 h-3.5" />}>看看收藏</InkButton>
              )}
            </div>
          </PaperCard>
        </ScrollReveal>
      </Container>
    </div>
  );
}
