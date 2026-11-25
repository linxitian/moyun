import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx and twMerge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generate URL-friendly slug from text, supporting both English and Chinese characters
 */
export function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s\t\n]+/g, '-') // Replace spaces with -
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '') // Remove non-word and non-CJK characters except hyphens
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Format date string or Date object to YYYY-MM-DD format
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Calculate reading time in minutes for Chinese and English content
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  // Strip Markdown/HTML tags for word count
  const cleanContent = content.replace(/<[^>]*>?/gm, '').replace(/[#*`~\[\]()_-]/g, '');
  // Chinese characters count
  const cjkMatches = cleanContent.match(/[\u4e00-\u9fa5]/g);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;
  // English words count
  const nonCjk = cleanContent.replace(/[\u4e00-\u9fa5]/g, ' ');
  const words = nonCjk.trim().split(/\s+/).filter(Boolean).length;
  
  // Average reading speed: 300 CJK characters/min, 200 English words/min
  const minutes = Math.ceil(cjkCount / 300 + words / 200);
  return Math.max(1, minutes);
}

/**
 * Format file size in bytes to human-readable string (KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
