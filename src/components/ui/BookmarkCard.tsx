import React from 'react';
import {
  ExternalLink,
  BookOpen,
  Palette,
  Wrench,
  Sparkles,
  Globe,
  Code,
  Zap,
  GitBranch,
  Terminal,
  Bookmark,
  Layers,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaperCard } from './PaperCard';

export interface BookmarkCardProps {
  title: string;
  url: string;
  description?: string | null;
  icon?: string | null;
  categoryName?: string | null;
  className?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Palette,
  Wrench,
  Sparkles,
  Globe,
  Code,
  Zap,
  GitBranch,
  Terminal,
  Bookmark,
  Layers,
  Compass,
};

export function BookmarkCard({
  title,
  url,
  description,
  icon,
  categoryName,
  className,
}: BookmarkCardProps) {
  const IconComponent = (icon && ICON_MAP[icon]) || Globe;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full focus:outline-none focus:ring-2 focus:ring-[#b83b3b] rounded-xl"
    >
      <PaperCard
        hoverEffect={true}
        className={cn(
          'relative p-5 h-full flex flex-col justify-between transition-all group-hover:border-[#b83b3b]/40 dark:group-hover:border-[#d24e4e]/40',
          className
        )}
      >
        <div>
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#f0ece1] dark:bg-[#22252e] flex items-center justify-center text-[#2d3a4b] dark:text-[#9ca3af] group-hover:text-[#b83b3b] dark:group-hover:text-[#d24e4e] group-hover:bg-[#b83b3b]/10 transition-colors">
                <IconComponent className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#1a1c23] dark:text-[#f3f4f6] group-hover:text-[#b83b3b] dark:group-hover:text-[#d24e4e] transition-colors leading-tight">
                  {title}
                </h4>
                {categoryName && (
                  <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] font-sans">
                    {categoryName}
                  </span>
                )}
              </div>
            </div>

            <ExternalLink className="w-4 h-4 text-[#9ca3af] group-hover:text-[#b83b3b] dark:group-hover:text-[#d24e4e] transition-all transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 flex-shrink-0" />
          </div>

          {description && (
            <p className="text-xs text-[#4f566b] dark:text-[#9ca3af] line-clamp-2 leading-relaxed mt-2 font-sans">
              {description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-2 flex items-center justify-between text-[11px] text-[#9ca3af]">
          <span className="truncate max-w-[200px] font-mono text-[10px] opacity-75">
            {url.replace(/^https?:\/\//, '')}
          </span>
          <span className="text-[#b83b3b] dark:text-[#d24e4e] opacity-0 group-hover:opacity-100 transition-opacity font-serif">
            访问 →
          </span>
        </div>
      </PaperCard>
    </a>
  );
}

export default BookmarkCard;
