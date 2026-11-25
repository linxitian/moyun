'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SealStamp } from '@/components/ui/SealStamp';
import { Lock, User, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        username: username.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('用户名或密码错误，请重新输入');
        setLoading(false);
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('系统登录失败，请稍后重试');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#faf8f5] dark:bg-[#121316] overflow-hidden">
      {/* Decorative Ink Wash Subtle Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#1a1c23]/5 dark:bg-[#f3f4f6]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#b83b3b]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Back to site home link */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-serif text-[#6b7280] hover:text-[#1a1c23] dark:text-[#9ca3af] dark:hover:text-[#f3f4f6] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回庭院首页</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <Card className="rounded-2xl border border-[#e6e2d8] bg-white/95 p-6 sm:p-8 shadow-xl dark:border-[#2d313c] dark:bg-[#1a1c22]/95 backdrop-blur-md">
          <CardHeader className="text-center p-0 pb-6">
            <div className="mx-auto mb-4 flex justify-center">
              <SealStamp size="lg" text="墨" />
            </div>
            <CardTitle className="font-serif text-2xl font-bold tracking-wide text-[#1a1c23] dark:text-[#f3f4f6]">
              墨韵 · 馆长登入
            </CardTitle>
            <CardDescription className="mt-1.5 text-xs text-[#6b7280] dark:text-[#9ca3af]">
              水墨写意，笔走龙蛇 · 管理控制台
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2.5 rounded-xl bg-[#b83b3b]/10 p-3 text-xs text-[#b83b3b] dark:bg-[#b83b3b]/20 dark:text-[#f87171] border border-[#b83b3b]/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                  管理员账号
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9ca3af]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="username"
                    autoComplete="username"
                    type="text"
                    required
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名 (如 admin)"
                    disabled={loading}
                    className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2.5 pl-10 pr-3.5 text-sm text-[#1a1c23] placeholder-[#9ca3af] focus:border-[#1a1c23] focus:outline-none focus:ring-1 focus:ring-[#1a1c23] dark:border-[#393e4f] dark:text-[#f3f4f6] dark:focus:border-[#f3f4f6] dark:focus:ring-[#f3f4f6] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                  通行密码
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9ca3af]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    autoComplete="current-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2.5 pl-10 pr-3.5 text-sm text-[#1a1c23] placeholder-[#9ca3af] focus:border-[#1a1c23] focus:outline-none focus:ring-1 focus:ring-[#1a1c23] dark:border-[#393e4f] dark:text-[#f3f4f6] dark:focus:border-[#f3f4f6] dark:focus:ring-[#f3f4f6] transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1a1c23] py-2.5 text-sm font-medium text-white hover:bg-[#272a34] dark:bg-[#f3f4f6] dark:text-[#121316] dark:hover:bg-[#e5e7eb] transition-all shadow-sm mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#b83b3b]" />
                    <span>正在验证凭据...</span>
                  </span>
                ) : (
                  '立即登入'
                )}
              </Button>

              <div className="mt-4 pt-4 border-t border-[#e6e2d8]/60 dark:border-[#2d313c]/60 text-center">
                <span className="text-[11px] font-mono text-[#9ca3af] dark:text-[#6b7280]">
                  仅限网站管理员访问
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
