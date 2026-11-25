'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BookOpen, Compass, Archive, User, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SealStamp } from '@/components/ui/SealStamp';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Container } from './Container';

const NAV_ITEMS = [
  { label: '首页', href: '/', icon: Home },
  { label: '博客', href: '/blog', icon: BookOpen },
  { label: '导航', href: '/nav', icon: Compass },
  { label: '档案馆', href: '/archive', icon: Archive },
  { label: '关于', href: '/about', icon: User },
];

export function Header({ siteName = '墨韵' }: { siteName?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300 backdrop-blur-md',
        scrolled
          ? 'bg-[#faf8f5]/85 dark:bg-[#121316]/85 border-b border-[#e6e2d8] dark:border-[#2d313c] shadow-sm'
          : 'bg-[#faf8f5]/60 dark:bg-[#121316]/60 border-b border-transparent'
      )}
    >
      <Container size="lg">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#b83b3b] rounded-lg p-1"
            aria-label={`${siteName}首页`}
          >
            <SealStamp size="md" text={siteName.slice(0, 1)} />
            <div className="flex flex-col">
              <span className="font-serif font-black text-xl sm:text-2xl text-[#1a1c23] dark:text-[#f3f4f6] tracking-wider leading-none group-hover:text-[#b83b3b] dark:group-hover:text-[#d24e4e] transition-colors">
                {siteName}
              </span>
              <span className="text-[10px] tracking-widest text-[#6b7280] dark:text-[#9ca3af] font-serif uppercase mt-1">
                MoYun · 水墨写意
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3.5 py-1.5 text-sm font-serif font-medium transition-all rounded-lg select-none',
                    active
                      ? 'text-[#b83b3b] dark:text-[#d24e4e] font-bold'
                      : 'text-[#4f566b] dark:text-[#9ca3af] hover:text-[#1a1c23] dark:hover:text-[#f3f4f6] hover:bg-[#f0ece1]/50 dark:hover:bg-[#22252e]/50'
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#b83b3b] dark:bg-[#d24e4e] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions: ThemeToggle + Mobile Hamburger */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#4f566b] dark:text-[#9ca3af] hover:text-[#1a1c23] dark:hover:text-[#f3f4f6] hover:bg-[#f0ece1] dark:hover:bg-[#22252e] focus:outline-none focus:ring-2 focus:ring-[#b83b3b]"
              aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile navigation sidebar/drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 sm:top-20 bg-[#faf8f5] dark:bg-[#121316] border-b border-[#e6e2d8] dark:border-[#2d313c] shadow-xl p-4 transition-all duration-300 animate-fade-in">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl font-serif text-base transition-colors',
                    active
                      ? 'bg-[#b83b3b]/10 dark:bg-[#b83b3b]/20 text-[#b83b3b] dark:text-[#d24e4e] font-bold'
                      : 'text-[#4f566b] dark:text-[#9ca3af] hover:bg-[#f0ece1] dark:hover:bg-[#22252e] hover:text-[#1a1c23] dark:hover:text-[#f3f4f6]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#b83b3b] dark:bg-[#d24e4e]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
