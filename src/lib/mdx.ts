import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const POSTS_PATH = path.join(process.cwd(), 'content', 'posts');

export interface MdxPostFrontmatter {
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  pinned?: boolean;
}

export interface MdxPost {
  frontmatter: MdxPostFrontmatter;
  content: string;
  readingTime: string;
  slug: string;
}

/**
 * Ensure the content/posts directory exists
 */
function ensurePostsDir() {
  if (!fs.existsSync(POSTS_PATH)) {
    fs.mkdirSync(POSTS_PATH, { recursive: true });
  }
}

/**
 * Get all MDX post slugs
 */
export function getMdxPostSlugs(): string[] {
  ensurePostsDir();
  return fs
    .readdirSync(POSTS_PATH)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => file.replace(/\.mdx?$/, ''));
}

/**
 * Get single MDX post by slug
 */
export function getMdxPostBySlug(slug: string): MdxPost | null {
  ensurePostsDir();
  const mdxPath = path.join(POSTS_PATH, `${slug}.mdx`);
  const mdPath = path.join(POSTS_PATH, `${slug}.md`);

  let filePath = '';
  if (fs.existsSync(mdxPath)) {
    filePath = mdxPath;
  } else if (fs.existsSync(mdPath)) {
    filePath = mdPath;
  } else {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  const time = readingTime(content);

  return {
    frontmatter: {
      title: data.title || slug,
      slug: data.slug || slug,
      date: data.date ? String(data.date) : new Date().toISOString(),
      excerpt: data.excerpt || '',
      coverImage: data.coverImage || '',
      category: data.category || '随笔',
      tags: data.tags || [],
      pinned: Boolean(data.pinned),
    },
    content,
    readingTime: time.text,
    slug,
  };
}

/**
 * Get all MDX posts sorted by date
 */
export function getAllMdxPosts(): MdxPost[] {
  const slugs = getMdxPostSlugs();
  const posts = slugs
    .map((slug) => getMdxPostBySlug(slug))
    .filter((post): post is MdxPost => post !== null)
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());

  return posts;
}
