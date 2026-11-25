import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';

interface MdxContentProps {
  source: string;
}

export function MdxContent({ source }: MdxContentProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed prose-headings:font-semibold prose-a:text-[#b83b3b] dark:prose-a:text-[#d24e4e] prose-pre:bg-[#1a1c23] dark:prose-pre:bg-[#121316]">
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, rehypeHighlight],
          },
        }}
      />
    </article>
  );
}
