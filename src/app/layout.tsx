import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSiteSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteSettings();
  return {
  title: {
    default: `${site.siteName} - ${site.siteSubtitle} | 个人数字庭院`,
    template: `%s | ${site.siteName}`,
  },
  description: site.siteDescription,
  keywords: [site.siteName, '个人网站', '水墨风', '博客', '作品'],
  authors: [{ name: site.authorName }],
  creator: site.authorName,
  icons: {
    icon: '/favicon.ico',
  },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = getSiteSettings();
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('moyun-theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && systemDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#faf8f5] text-[#1a1c23] dark:bg-[#121316] dark:text-[#f3f4f6] selection:bg-[#b83b3b]/20 selection:text-[#b83b3b] font-sans antialiased transition-colors duration-300">
        <Header siteName={site.siteName} />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer site={site} />
      </body>
    </html>
  );
}
