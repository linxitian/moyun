'use client';

import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  Eye,
  Edit3,
  Columns,
  Loader2,
} from 'lucide-react';
import { calculateReadingTime } from '@/lib/utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  minHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  minHeight = '450px',
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'split'>('edit');
  const [uploadingImage, setUploadingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to insert markdown tags around selection
  const insertFormatting = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;

    const replacement = `${before}${selectedText}${after}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 10);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '上传图片失败');
        return;
      }

      insertFormatting(`\n![${file.name}](${data.url})\n`, '', '');
    } catch {
      alert('上传图片出错');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const readingTime = calculateReadingTime(value);
  const wordCount = value.trim() ? value.replace(/\s+/g, '').length : 0;

  return (
    <div className="flex flex-col rounded-xl border border-[#d1d5db] bg-white shadow-xs dark:border-[#393e4f] dark:bg-[#1a1c22] overflow-hidden">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#e6e2d8] bg-[#faf8f5] px-3 py-2 text-[#4f566b] dark:border-[#2d313c] dark:bg-[#22252e] dark:text-[#9ca3af]">
        {/* Formatting Actions */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            title="粗体 (Bold)"
            onClick={() => insertFormatting('**', '**', '粗体文字')}
            className="rounded p-1.5 hover:bg-[#e6e2d8] dark:hover:bg-[#2d313c] transition-colors"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="斜体 (Italic)"
            onClick={() => insertFormatting('*', '*', '斜体文字')}
            className="rounded p-1.5 hover:bg-[#e6e2d8] dark:hover:bg-[#2d313c] transition-colors"
          >
            <Italic className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-[#d1d5db] dark:bg-[#393e4f] mx-1" />
          <button
            type="button"
            title="二级标题 (H2)"
            onClick={() => insertFormatting('\n## ', '\n', '二级标题')}
            className="rounded p-1.5 hover:bg-[#e6e2d8] dark:hover:bg-[#2d313c] transition-colors"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="三级标题 (H3)"
            onClick={() => insertFormatting('\n### ', '\n', '三级标题')}
            className="rounded p-1.5 hover:bg-[#e6e2d8] dark:hover:bg-[#2d313c] transition-colors"
          >
            <Heading3 className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-[#d1d5db] dark:bg-[#393e4f] mx-1" />
          <button
            type="button"
            title="引用块 (Quote)"
            onClick={() => insertFormatting('\n> ', '\n', '引用内容')}
            className="rounded p-1.5 hover:bg-[#e6e2d8] dark:hover:bg-[#2d313c] transition-colors"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="代码块 (Code Block)"
            onClick={() => insertFormatting('\n```typescript\n', '\n```\n', '// 在此输入代码')}
            className="rounded p-1.5 hover:bg-[#e6e2d8] dark:hover:bg-[#2d313c] transition-colors"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="无序列表 (List)"
            onClick={() => insertFormatting('\n- ', '\n', '列表项')}
            className="rounded p-1.5 hover:bg-[#e6e2d8] dark:hover:bg-[#2d313c] transition-colors"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="插入链接 (Link)"
            onClick={() => insertFormatting('[', '](https://example.com)', '链接文字')}
            className="rounded p-1.5 hover:bg-[#e6e2d8] dark:hover:bg-[#2d313c] transition-colors"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          {/* Direct Image upload in editor */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="editor-img-upload"
          />
          <button
            type="button"
            title="插入/上传图片"
            disabled={uploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="rounded p-1.5 hover:bg-[#e6e2d8] dark:hover:bg-[#2d313c] transition-colors text-[#b83b3b]"
          >
            {uploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* View Switcher & Word Count */}
        <div className="flex items-center gap-3 mt-1 sm:mt-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#6b7280] dark:text-[#9ca3af]">
            <span>字数: {wordCount}</span>
            <span>·</span>
            <span>约 {readingTime} 分钟阅读</span>
          </div>

          <div className="flex items-center rounded-lg bg-[#e6e2d8]/50 p-0.5 dark:bg-[#121316]">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                activeTab === 'edit'
                  ? 'bg-white text-[#1a1c23] shadow-xs dark:bg-[#272a34] dark:text-white'
                  : 'text-[#6b7280] hover:text-[#1a1c23] dark:text-[#9ca3af]'
              }`}
            >
              <Edit3 className="h-3 w-3" />
              <span>编辑</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`hidden md:flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                activeTab === 'split'
                  ? 'bg-white text-[#1a1c23] shadow-xs dark:bg-[#272a34] dark:text-white'
                  : 'text-[#6b7280] hover:text-[#1a1c23] dark:text-[#9ca3af]'
              }`}
            >
              <Columns className="h-3 w-3" />
              <span>分屏</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white text-[#1a1c23] shadow-xs dark:bg-[#272a34] dark:text-white'
                  : 'text-[#6b7280] hover:text-[#1a1c23] dark:text-[#9ca3af]'
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>预览</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="relative flex-1 min-h-[400px]">
        {activeTab === 'edit' && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="支持标准 Markdown 语法，水墨挥毫，意境深远..."
            style={{ minHeight }}
            className="w-full h-full p-4 font-mono text-sm leading-relaxed bg-transparent text-[#1a1c23] dark:text-[#f3f4f6] resize-y focus:outline-none placeholder-[#9ca3af]"
          />
        )}

        {activeTab === 'preview' && (
          <div
            style={{ minHeight }}
            className="w-full p-6 overflow-y-auto prose-ink max-w-none text-[#1a1c23] dark:text-[#f3f4f6]"
          >
            <Markdown remarkPlugins={[remarkGfm]} skipHtml>{value || '暂无内容…'}</Markdown>
          </div>
        )}

        {activeTab === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e6e2d8] dark:divide-[#2d313c] h-full">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="在此输入 Markdown..."
              style={{ minHeight }}
              className="w-full h-full p-4 font-mono text-sm leading-relaxed bg-transparent text-[#1a1c23] dark:text-[#f3f4f6] resize-none focus:outline-none"
            />
            <div
              style={{ minHeight }}
              className="w-full p-6 overflow-y-auto prose-ink max-w-none text-[#1a1c23] dark:text-[#f3f4f6]"
            >
              <Markdown remarkPlugins={[remarkGfm]} skipHtml>{value || '暂无内容…'}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
