'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Globe,
  User,
  FileText,
  Check,
  AlertCircle,
  Loader2,
  Code2,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { updateSettingsAction } from '@/lib/actions/settings';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'author' | 'about'>('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form fields
  const [siteName, setSiteName] = useState('墨韵');
  const [siteSubtitle, setSiteSubtitle] = useState('水墨写意，笔走龙蛇');
  const [siteDescription, setSiteDescription] = useState('');
  const [icp, setIcp] = useState('');
  const [footerText, setFooterText] = useState('');

  const [authorName, setAuthorName] = useState('琳习田');
  const [authorBio, setAuthorBio] = useState('');
  const [avatar, setAvatar] = useState('/avatar.png');
  const [githubUrl, setGithubUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [email, setEmail] = useState('');

  const [aboutContent, setAboutContent] = useState('');

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.settings) {
          const s = data.settings;
          if (s.siteName) setSiteName(s.siteName);
          if (s.siteSubtitle) setSiteSubtitle(s.siteSubtitle);
          if (s.siteDescription) setSiteDescription(s.siteDescription);
          if (s.icp) setIcp(s.icp);
          if (s.footerText) setFooterText(s.footerText);

          if (s.authorName) setAuthorName(s.authorName);
          if (s.authorBio) setAuthorBio(s.authorBio);
          if (s.avatar) setAvatar(s.avatar);
          if (s.githubUrl) setGithubUrl(s.githubUrl);
          if (s.twitterUrl) setTwitterUrl(s.twitterUrl);
          if (s.email) setEmail(s.email);

          if (s.aboutContent) setAboutContent(s.aboutContent);
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const payload: Record<string, string | null> = {
      siteName: siteName.trim(),
      siteSubtitle: siteSubtitle.trim(),
      siteDescription: siteDescription.trim(),
      icp: icp.trim(),
      footerText: footerText.trim(),
      authorName: authorName.trim(),
      authorBio: authorBio.trim(),
      avatar: avatar.trim(),
      githubUrl: githubUrl.trim(),
      twitterUrl: twitterUrl.trim(),
      email: email.trim(),
      aboutContent: aboutContent,
    };

    try {
      const res = await updateSettingsAction(payload);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccessMsg('配置已成功保存并实时生效！');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '保存设置出错，请重试';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e2d8] pb-5 dark:border-[#2d313c]">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1a1c23] dark:text-[#f3f4f6]">
            系统全局配置
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af]">
            定制墨韵全站品牌文案、主人档案、关于页内容及社交信息。
          </p>
        </div>

        <Button
          type="submit"
          disabled={saving || loading}
          className="rounded-xl bg-[#1a1c23] px-5 py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-[#272a34] dark:bg-[#f3f4f6] dark:text-[#121316] dark:hover:bg-[#e5e7eb] transition-all self-start sm:self-auto"
        >
          {saving ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-4 w-4 animate-spin text-[#b83b3b]" />
              <span>保存中...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Save className="h-4 w-4" />
              <span>保存全局配置</span>
            </span>
          )}
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-[#b83b3b]/10 p-3.5 text-xs text-[#b83b3b] dark:bg-[#b83b3b]/20 dark:text-[#f87171] border border-[#b83b3b]/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e6e2d8] dark:border-[#2d313c] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
            activeTab === 'basic'
              ? 'bg-[#1a1c23] text-white dark:bg-[#f3f4f6] dark:text-[#121316]'
              : 'text-[#6b7280] hover:bg-[#e6e2d8]/60 dark:text-[#9ca3af] dark:hover:bg-[#22252e]'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>网站基本信息</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('author')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
            activeTab === 'author'
              ? 'bg-[#1a1c23] text-white dark:bg-[#f3f4f6] dark:text-[#121316]'
              : 'text-[#6b7280] hover:bg-[#e6e2d8]/60 dark:text-[#9ca3af] dark:hover:bg-[#22252e]'
          }`}
        >
          <User className="h-4 w-4" />
          <span>馆长资料与社交</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
            activeTab === 'about'
              ? 'bg-[#1a1c23] text-white dark:bg-[#f3f4f6] dark:text-[#121316]'
              : 'text-[#6b7280] hover:bg-[#e6e2d8]/60 dark:text-[#9ca3af] dark:hover:bg-[#22252e]'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>关于页面内容</span>
        </button>
      </div>

      {/* Tab 1: Basic Site Info */}
      {activeTab === 'basic' && (
        <Card className="rounded-2xl border border-[#e6e2d8] p-6 shadow-xs dark:border-[#2d313c] dark:bg-[#1a1c22] space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                网站主标题 (Site Name)
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="墨韵"
                className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-sm text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                副标题标语 (Subtitle)
              </label>
              <input
                type="text"
                value={siteSubtitle}
                onChange={(e) => setSiteSubtitle(e.target.value)}
                placeholder="水墨写意，笔走龙蛇"
                className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-sm text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
              网站描述 (SEO Meta Description)
            </label>
            <textarea
              rows={3}
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="琳习田的个人网站。"
              className="w-full rounded-xl border border-[#d1d5db] bg-transparent p-3 text-sm text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#e6e2d8] dark:border-[#2d313c]">
            <div>
              <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                ICP 备案号
              </label>
              <input
                type="text"
                value={icp}
                onChange={(e) => setIcp(e.target.value)}
                placeholder="京ICP备20260001号-1"
                className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-sm font-mono text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                页脚版权署名
              </label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="© 2026 琳习田 · 墨韵 (MoYun). 笔端起波澜，纸上有烟云。"
                className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-sm text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab 2: Author & Social */}
      {activeTab === 'author' && (
        <Card className="rounded-2xl border border-[#e6e2d8] p-6 shadow-xs dark:border-[#2d313c] dark:bg-[#1a1c22] space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                站长昵称 / 笔名
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="琳习田"
                className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-sm text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                联系邮箱 (Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="moke@example.com"
                className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-sm text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
              个人一句话介绍 (Bio)
            </label>
            <input
              type="text"
              value={authorBio}
              onChange={(e) => setAuthorBio(e.target.value)}
              placeholder="用一句话介绍自己，以及你想在墨韵记录的事。"
              className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 px-3 text-sm text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
            />
          </div>

          <div>
            <ImageUploader
              value={avatar}
              onChange={setAvatar}
              label="头像图片 (Avatar)"
              placeholder="/avatar.png 或图片 URL"
            />
          </div>

          <div className="pt-2 border-t border-[#e6e2d8] dark:border-[#2d313c] space-y-4">
            <h4 className="font-serif font-bold text-xs text-[#1a1c23] dark:text-[#f3f4f6]">
              社交账号链接
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                  GitHub 链接
                </label>
                <div className="relative">
                  <Code2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 pl-9 pr-3 text-sm font-mono text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4f566b] dark:text-[#9ca3af] mb-1.5">
                  Twitter / X 链接
                </label>
                <div className="relative">
                  <Share2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
                  <input
                    type="url"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://x.com/username"
                    className="w-full rounded-xl border border-[#d1d5db] bg-transparent py-2 pl-9 pr-3 text-sm font-mono text-[#1a1c23] focus:border-[#1a1c23] focus:outline-none dark:border-[#393e4f] dark:text-[#f3f4f6]"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: About Page Content */}
      {activeTab === 'about' && (
        <Card className="rounded-2xl border border-[#e6e2d8] p-6 shadow-xs dark:border-[#2d313c] dark:bg-[#1a1c22] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-sm text-[#1a1c23] dark:text-[#f3f4f6]">
                关于页面详情 (Markdown)
              </h3>
              <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
                在前台 /about 页面展示的自述与庭院造景理念。
              </p>
            </div>
            <a
              href="/about"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-[#b83b3b] hover:underline"
            >
              <span>查看前台关于页</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <MarkdownEditor
            value={aboutContent}
            onChange={setAboutContent}
            minHeight="450px"
          />
        </Card>
      )}
    </form>
  );
}
