'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  FileText,
  Bookmark,
  Download,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SealStamp } from '@/components/ui/SealStamp';
import { ConfirmDialog } from './ConfirmDialog';

interface AdminSessionUser {
  name?: string | null;
  role?: string | null;
  email?: string | null;
  image?: string | null;
}

interface AdminLayoutClientProps {
  session: { user?: AdminSessionUser } | null;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: '控制台', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: '文章管理', href: '/admin/posts', icon: FileText, exact: false },
  { label: '网址导航', href: '/admin/bookmarks', icon: Bookmark, exact: false },
  { label: '资源下载', href: '/admin/downloads', icon: Download, exact: false },
  { label: '系统配置', href: '/admin/settings', icon: Settings, exact: false },
];

export function AdminLayoutClient({ session, children }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // If on login page, render children cleanly without admin chrome
  if (pathname === '/admin/login') {
    return <main className="min-h-screen bg-[#faf8f5] dark:bg-[#121316]">{children}</main>;
  }

  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: '/admin/login' });
    } catch (e) {
      console.error('Logout error:', e);
      router.push('/admin/login');
    }
  };

  // Compute current page title for breadcrumb
  const getCurrentPageTitle = () => {
    if (pathname === '/admin') return '仪表盘';
    if (pathname === '/admin/posts/new') return '撰写新博文';
    if (pathname.startsWith('/admin/posts') && pathname.includes('/edit')) return '编辑文章';
    if (pathname.startsWith('/admin/posts')) return '文章管理';
    if (pathname === '/admin/bookmarks/new') return '添加导航书签';
    if (pathname.startsWith('/admin/bookmarks') && pathname.includes('/edit')) return '编辑导航书签';
    if (pathname.startsWith('/admin/bookmarks')) return '网址导航';
    if (pathname === '/admin/downloads/new') return '发布资源文件';
    if (pathname.startsWith('/admin/downloads')) return '资源下载';
    if (pathname.startsWith('/admin/settings')) return '系统配置';
    return '管理控制台';
  };

  return (
    <div className="min-h-screen flex bg-[#faf8f5] dark:bg-[#121316] text-[#1a1c23] dark:text-[#f3f4f6]">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#e6e2d8] dark:border-[#2d313c] bg-[#f5f2eb]/70 dark:bg-[#16181f]/70 backdrop-blur-md shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#e6e2d8] dark:border-[#2d313c]">
          <SealStamp size="sm" text="墨" />
          <div className="flex flex-col">
            <span className="font-serif font-black text-lg tracking-wider text-[#1a1c23] dark:text-[#f3f4f6]">
              墨韵 · 中台
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#6b7280] dark:text-[#9ca3af]">
              MoYun Admin
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#1a1c23] text-white shadow-xs dark:bg-[#f3f4f6] dark:text-[#121316]'
                    : 'text-[#4f566b] hover:bg-[#e6e2d8]/60 dark:text-[#9ca3af] dark:hover:bg-[#22252e] hover:text-[#1a1c23] dark:hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#b83b3b] dark:text-[#b83b3b]' : ''}`} />
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#b83b3b]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions inside sidebar */}
        <div className="p-3 border-t border-[#e6e2d8] dark:border-[#2d313c] space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-[#6b7280] hover:text-[#1a1c23] hover:bg-[#e6e2d8]/50 dark:text-[#9ca3af] dark:hover:text-white dark:hover:bg-[#22252e] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span>浏览前台庭院</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-[#b83b3b] hover:bg-[#b83b3b]/10 dark:text-[#f87171] dark:hover:bg-[#b83b3b]/20 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span>退出当前登录</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-[#faf8f5] dark:bg-[#16181f] border-r border-[#e6e2d8] dark:border-[#2d313c] flex flex-col z-50 p-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#e6e2d8] dark:border-[#2d313c]">
              <div className="flex items-center gap-2">
                <SealStamp size="sm" text="墨" />
                <span className="font-serif font-bold text-base">墨韵管理中台</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-[#6b7280] hover:bg-[#f0ece1] dark:text-[#9ca3af] dark:hover:bg-[#22252e]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const active = isLinkActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[#1a1c23] text-white dark:bg-[#f3f4f6] dark:text-[#121316]'
                        : 'text-[#4f566b] hover:bg-[#e6e2d8]/60 dark:text-[#9ca3af] dark:hover:bg-[#22252e]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#e6e2d8] dark:border-[#2d313c] space-y-1">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-[#6b7280] hover:text-[#1a1c23] dark:text-[#9ca3af]"
              >
                <ExternalLink className="h-4 w-4" />
                <span>浏览前台庭院</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-[#b83b3b]"
              >
                <LogOut className="h-4 w-4" />
                <span>退出登录</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#e6e2d8] dark:border-[#2d313c] bg-[#faf8f5]/80 dark:bg-[#121316]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#6b7280] hover:bg-[#e6e2d8] dark:text-[#9ca3af] dark:hover:bg-[#22252e]"
              aria-label="打开侧边导航"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden sm:inline text-[#6b7280] dark:text-[#9ca3af]">管理后台</span>
              <ChevronRight className="hidden sm:inline h-3.5 w-3.5 text-[#9ca3af]" />
              <span className="font-serif font-bold text-[#1a1c23] dark:text-[#f3f4f6]">
                {getCurrentPageTitle()}
              </span>
            </div>
          </div>

          {/* Right Header: Theme Toggle + User Info */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />

            <div className="h-5 w-px bg-[#e6e2d8] dark:bg-[#2d313c]" />

            {/* User Info */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1c23] text-white text-xs font-serif font-bold dark:bg-[#f3f4f6] dark:text-[#121316]">
                {session?.user?.name ? session.user.name.charAt(0) : '墨'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#1a1c23] dark:text-[#f3f4f6] leading-none">
                  {session?.user?.name || '管理员'}
                </span>
                <span className="mt-1 flex items-center gap-1 text-[10px] text-[#6b7280] dark:text-[#9ca3af] leading-none">
                  <ShieldCheck className="h-2.5 w-2.5 text-[#b83b3b]" />
                  <span>{session?.user?.role || 'admin'}</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              title="退出登录"
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 rounded-lg text-[#6b7280] hover:text-[#b83b3b] hover:bg-[#b83b3b]/10 dark:text-[#9ca3af] dark:hover:text-[#f87171] transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="确认退出系统"
        message="您确定要退出墨韵后台管理系统吗？退出后需要重新输入管理员凭据。"
        confirmText="确认退出"
        cancelText="取消"
        isDestructive={false}
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
