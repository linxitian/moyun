import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { randomBytes } from 'node:crypto';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const dbPath = path.resolve(process.env.DATABASE_PATH || path.join('data', 'moyun.db'));
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

console.log('🚀 Running database migrations...');

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'admin' NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    category_id INTEGER REFERENCES categories(id),
    status TEXT DEFAULT 'draft' NOT NULL,
    pinned INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS post_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bookmark_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category_id INTEGER REFERENCES bookmark_categories(id),
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER DEFAULT 0,
    file_type TEXT,
    category TEXT,
    download_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT
  );
`);

// Repair links from older databases before enforcing the schema's unique index.
sqlite.transaction(() => {
  sqlite.exec(`
    DELETE FROM post_tags
    WHERE id NOT IN (SELECT MIN(id) FROM post_tags GROUP BY post_id, tag_id);
    CREATE UNIQUE INDEX IF NOT EXISTS post_tags_post_id_tag_id_unique
    ON post_tags (post_id, tag_id);
  `);
})();

console.log('✅ Tables created successfully.');
console.log('🌱 Seeding database...');

// 1. Seed Admin User
const adminUser = sqlite.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!adminUser) {
  const password = process.env.ADMIN_PASSWORD || randomBytes(24).toString('base64url');
  const passwordHash = bcrypt.hashSync(password, 12);
  sqlite.prepare(`
    INSERT INTO users (username, password_hash, display_name, avatar, role)
    VALUES (?, ?, ?, ?, ?)
  `).run('admin', passwordHash, '琳习田', '/avatar.png', 'admin');
  if (!process.env.ADMIN_PASSWORD) {
    fs.mkdirSync('.local', { recursive: true, mode: 0o700 });
    fs.writeFileSync('.local/admin-credentials.txt', `用户名：admin\n密码：${password}\n`, { mode: 0o600 });
    console.log('👤 Admin created. Credentials saved to .local/admin-credentials.txt');
  } else {
    console.log('👤 Admin created using ADMIN_PASSWORD');
  }
} else {
  console.log('👤 Admin user already exists');
}

// 2. Seed Categories
const initialCategories = [
  { name: '技术', slug: 'tech', description: '前沿技术探索、全栈架构与代码实践', sortOrder: 1 },
  { name: '生活', slug: 'life', description: '烟火人间、生活点滴与行者足迹', sortOrder: 2 },
  { name: '随笔', slug: 'essays', description: '浮生笔墨、哲学心语与读书感悟', sortOrder: 3 },
  { name: '设计', slug: 'design', description: '东方美学、UI设计与视觉艺术探索', sortOrder: 4 },
];

const categoryMap = new Map<string, number>();
for (const cat of initialCategories) {
  const existing = sqlite.prepare('SELECT id FROM categories WHERE slug = ?').get(cat.slug) as { id: number } | undefined;
  if (!existing) {
    const res = sqlite.prepare(`
      INSERT INTO categories (name, slug, description, sort_order)
      VALUES (?, ?, ?, ?)
    `).run(cat.name, cat.slug, cat.description, cat.sortOrder);
    categoryMap.set(cat.slug, Number(res.lastInsertRowid));
  } else {
    categoryMap.set(cat.slug, existing.id);
  }
}
console.log('📁 Categories seeded');

// 3. Seed Tags
const initialTags = [
  { name: 'Next.js', slug: 'nextjs' },
  { name: 'React', slug: 'react' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: '东方美学', slug: 'oriental-aesthetics' },
  { name: '架构设计', slug: 'architecture' },
  { name: '生活随想', slug: 'thoughts' },
];

const tagMap = new Map<string, number>();
for (const tag of initialTags) {
  const existing = sqlite.prepare('SELECT id FROM tags WHERE slug = ?').get(tag.slug) as { id: number } | undefined;
  if (!existing) {
    const res = sqlite.prepare(`
      INSERT INTO tags (name, slug)
      VALUES (?, ?)
    `).run(tag.name, tag.slug);
    tagMap.set(tag.slug, Number(res.lastInsertRowid));
  } else {
    tagMap.set(tag.slug, existing.id);
  }
}
console.log('🏷️ Tags seeded');

// 4. Seed Bookmark Categories
const initialBookmarkCategories = [
  { name: '开发文档', slug: 'dev-docs', icon: 'BookOpen', description: '核心框架与官方权威开发文档', sortOrder: 1 },
  { name: '设计资源', slug: 'design-resources', icon: 'Palette', description: '传统配色、图标灵感与设计规范', sortOrder: 2 },
  { name: '效率工具', slug: 'tools', icon: 'Wrench', description: '工程师日常开发与生产力工具', sortOrder: 3 },
  { name: '有趣网站', slug: 'interesting-sites', icon: 'Sparkles', description: '令人惊艳的交互与创意数字空间', sortOrder: 4 },
];

const bookmarkCategoryMap = new Map<string, number>();
for (const bcat of initialBookmarkCategories) {
  const existing = sqlite.prepare('SELECT id FROM bookmark_categories WHERE slug = ?').get(bcat.slug) as { id: number } | undefined;
  if (!existing) {
    const res = sqlite.prepare(`
      INSERT INTO bookmark_categories (name, slug, icon, description, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `).run(bcat.name, bcat.slug, bcat.icon, bcat.description, bcat.sortOrder);
    bookmarkCategoryMap.set(bcat.slug, Number(res.lastInsertRowid));
  } else {
    bookmarkCategoryMap.set(bcat.slug, existing.id);
  }
}
console.log('📑 Bookmark categories seeded');

// 5. Seed Bookmarks
const initialBookmarks = [
  {
    title: 'Next.js 官方文档',
    url: 'https://nextjs.org/docs',
    description: 'React 生态中最强全栈框架的官方开发文档指南',
    icon: 'Globe',
    categorySlug: 'dev-docs',
    sortOrder: 1,
  },
  {
    title: 'Tailwind CSS',
    url: 'https://tailwindcss.com',
    description: '以实用工具类为核心的高效现代 CSS 框架',
    icon: 'Code',
    categorySlug: 'dev-docs',
    sortOrder: 2,
  },
  {
    title: '中国传统色谱',
    url: 'http://zhongguose.com',
    description: '收集中国传统色彩与典雅名称的色谱美学网站',
    icon: 'Palette',
    categorySlug: 'design-resources',
    sortOrder: 1,
  },
  {
    title: 'Raycast',
    url: 'https://www.raycast.com',
    description: 'Mac 上不可或缺的极速生产力启动器与工作流工具',
    icon: 'Zap',
    categorySlug: 'tools',
    sortOrder: 1,
  },
  {
    title: 'GitHub',
    url: 'https://github.com',
    description: '全球最大的开源软件开发与协作平台',
    icon: 'GitBranch',
    categorySlug: 'tools',
    sortOrder: 2,
  },
];

for (const bm of initialBookmarks) {
  const catId = bookmarkCategoryMap.get(bm.categorySlug);
  const existing = sqlite.prepare('SELECT id FROM bookmarks WHERE url = ?').get(bm.url);
  if (!existing && catId) {
    sqlite.prepare(`
      INSERT INTO bookmarks (title, url, description, icon, category_id, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(bm.title, bm.url, bm.description, bm.icon, catId, bm.sortOrder);
  }
}
console.log('🔖 Bookmarks seeded');

// 6. Seed Settings
const initialSettings = [
  { key: 'siteName', value: '墨韵' },
  { key: 'siteSubtitle', value: '水墨写意，笔走龙蛇' },
  { key: 'siteDescription', value: '琳习田的个人网站。' },
  { key: 'authorName', value: '琳习田' },
  { key: 'authorBio', value: '「墨韵」的主人，在字里行间记录日常，在一方留白里安放所思。' },
  { key: 'githubUrl', value: 'https://github.com' },
  { key: 'icp', value: '' },
  { key: 'footerText', value: '© 2026 琳习田 · 墨韵 (MoYun). 笔端起波澜，纸上有烟云。' },
];

for (const setting of initialSettings) {
  sqlite.prepare(`
    INSERT INTO settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO NOTHING
  `).run(setting.key, setting.value);
}
console.log('⚙️ Settings seeded');

// 7. Seed Posts
const initialPosts = [
  {
    title: '墨韵初构：谈现代 Web 架构与东方极简美学的融合',
    slug: 'moyun-architecture-and-oriental-aesthetics',
    excerpt: '在快节奏的数字化时代，如何以现代全栈架构承载传统水墨的留白意境？本文记录了墨韵网站从技术选型到视觉落地的思考。',
    coverImage: '/uploads/ink-architecture.jpg',
    categorySlug: 'tech',
    tags: ['nextjs', 'typescript', 'oriental-aesthetics'],
    status: 'published',
    pinned: 1,
    viewCount: 128,
    content: `# 墨韵初构：谈现代 Web 架构与东方极简美学的融合

> “夫画者，从于心者也。笔情墨趣，皆由心生。” —— 宾虹笔谈

在数字媒介飞速迭代的今天，我们习惯了高对比度、霓虹流光与信息密集的界面交互。然而，数字空间并非只能是冰冷的机械组件堆叠。**墨韵 (MoYun)** 的诞生，正是源于一次尝试：以现代工程体系为骨骼，以传统东方水墨为神韵，构建一座兼具优雅性能与精神留白的个人数字庭院。

---

## 一、架构选型：轻量、稳健与自洽

构建墨韵时，技术选型坚持了三条基本原则：**极致性能**、**自洽存储**与**开发体验**。

1. **Next.js 15 App Router**：服务端渲染 (RSC) 与静态生成的完美融合，带来毫秒级的首屏渲染体验。
2. **SQLite + Drizzle ORM**：轻量单文件数据库，无须额外维护外部数据库集群，天然具备极致的读写性能与跨机器便携性。
3. **Tailwind CSS 4**：通过 CSS 原生变量驱动主题色彩，将水墨五色（焦、浓、重、淡、清）精确量化入设计令牌。

\`\`\`typescript
// 优雅而纯粹的数据模型定义
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  pinned: integer('pinned', { mode: 'boolean' }).default(false),
  viewCount: integer('view_count').default(0),
  createdAt: text('created_at').default(sql\`CURRENT_TIMESTAMP\`).notNull(),
});
\`\`\`

---

## 二、视觉语言：五色墨相与留白

在水墨画中，“运墨而五色具”：
- **焦墨**：字里行间最深邃的标题黑，如古砚初发；
- **浓墨**：正文叙述之深沉，提供极佳的阅读舒适度；
- **淡墨**：引文、注释与时间戳，退居其后，安静自守；
- **宣纸**：微微泛着草木温润的底色，杜绝刺眼的冷白；
- **朱砂**：钤印之红，用于焦点按钮与高亮微光，万绿丛中一点红。

真正的东方极简，不是空无一物，而是**“计白当黑”**。界面的留白不仅为了呼吸，更为了让优质文字与思考沉淀于读者的意识中央。

---

## 三、写在最后

写代码与研墨作画并无二致。一段干净利落的函数，与一笔遒劲有力的线条，都在追求某种内在的平衡与纯粹。墨韵仍在持续演进中，期待与诸君在此相遇。
`,
  },
  {
    title: '静水流深：程序员的日常冥想与专注之道',
    slug: 'mindfulness-and-focus-for-developers',
    excerpt: '在信息轰炸的湍流中，保持内心的澄澈与深度专注，是程序员最可贵的修行。',
    coverImage: '/uploads/deep-focus.jpg',
    categorySlug: 'essays',
    tags: ['thoughts'],
    status: 'published',
    pinned: 0,
    viewCount: 89,
    content: `# 静水流深：程序员的日常冥想与专注之道

每当指尖在机械键盘上飞舞，屏幕上的字符如溪流奔涌时，我们常会产生一种错觉：忙碌即充实。

然而，频繁的即时通知、无穷无尽的拉取请求与技术的更迭焦虑，往往在不知不觉中将我们的注意力撕得粉碎。

## 心境如池

古人说：“水静极则形象明，心静极则智慧生。”

当心绪浮躁时，哪怕是最简单的 Bug 也会让人抓狂；而当心神宁静如古井无波时，复杂的逻辑脉络反而会在脑海中自然舒展。

每天清晨，给自己留出三十分钟无干扰的“白纸时间”：
- 不看社交媒体与群聊
- 泡一杯清茶，温润喉舌
- 梳理今天最核心的一件关键任务

## 专注的微习惯

1. **单任务深潜**：番茄钟并非束缚，而是为心流划定安全岛。
2. **代码留白**：不仅在代码行间加空行，更在思考与动手之间留出缓冲。
3. **断网漫步**：让潜意识在散步中自主重组思维碎片。

保持内心的宁静，才能写出有灵魂的程序。
`,
  },
  {
    title: '从色彩系统看中式水墨风格界面设计',
    slug: 'chinese-ink-wash-ui-design',
    excerpt: '探讨水墨“焦、浓、重、淡、清”五色在现代 UI 设计系统中的转换与实践应用。',
    coverImage: '/uploads/ink-colors.jpg',
    categorySlug: 'design',
    tags: ['oriental-aesthetics'],
    status: 'published',
    pinned: 0,
    viewCount: 64,
    content: `# 从色彩系统看中式水墨风格界面设计

现代 UI 设计长期被 Western Modernism（包豪斯、扁平化、新拟态）所主导。在探索具有中国美学韵味的数字产品时，我们常常陷入将传统元素硬生生堆砌在网页上的误区——贴几张水墨背景图、加几个书法字，往往适得其反。

## 提取水墨本质：灰阶的质感

水墨艺术的核心在于层次丰富的单色表达。在 Tailwind CSS 4 的设计体系中，我们抽象出以下语义色彩：

\`\`\`css
--color-ink-950: #0f1115; /* 焦墨 */
--color-ink-900: #1a1c23; /* 浓墨 */
--color-ink-700: #393e4f; /* 重墨 */
--color-ink-500: #6b7280; /* 淡墨 */
--color-ink-200: #e5e7eb; /* 清墨 */
--color-paper-light: #faf8f5; /* 生宣暖白 */
--color-cinnabar: #b83b3b; /* 传统朱砂印泥 */
\`\`\`

## 纹理与光影的克制

在界面中，纹理应当如同若隐若现的宣纸纹理，不喧宾夺主。卡片的阴影也应由尖锐的硬阴影转变为如墨汁晕染开的超柔和弥散阴影：

\`\`\`css
.ink-shadow {
  box-shadow: 0 4px 20px -2px rgba(26, 28, 35, 0.06);
}
\`\`\`

在克制与流动之间，东方美学在数字空间得以重生。
`,
  },
];

for (const postData of initialPosts) {
  const catId = categoryMap.get(postData.categorySlug);
  const existing = sqlite.prepare('SELECT id FROM posts WHERE slug = ?').get(postData.slug) as { id: number } | undefined;
  let postId: number;

  if (!existing) {
    const res = sqlite.prepare(`
      INSERT INTO posts (title, slug, content, excerpt, cover_image, category_id, status, pinned, view_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      postData.title,
      postData.slug,
      postData.content,
      postData.excerpt,
      postData.coverImage,
      catId,
      postData.status,
      postData.pinned,
      postData.viewCount
    );
    postId = Number(res.lastInsertRowid);
  } else {
    postId = existing.id;
  }

  // Link post tags
  for (const tagSlug of postData.tags) {
    const tagId = tagMap.get(tagSlug);
    if (tagId) {
      sqlite.prepare(`
        INSERT INTO post_tags (post_id, tag_id)
        SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM post_tags WHERE post_id = ? AND tag_id = ?)
      `).run(postId, tagId, postId, tagId);
    }
  }
}
console.log('📝 Posts seeded');

// 8. Seed Downloads
const initialDownloads = [
  {
    title: '墨韵 4K 水墨意境壁纸集',
    description: '包含 12 张高清原创东方意境壁纸，适配布景与桌面壁纸。',
    fileName: 'moyun-wallpapers.zip',
    filePath: '/uploads/moyun-wallpapers.zip',
    fileSize: 16777216,
    fileType: 'application/zip',
    category: '设计资源',
    downloadCount: 42,
  },
  {
    title: '墨韵视觉设计规范白皮书 (PDF)',
    description: '系统阐述墨韵设计系统的色彩、排版、组件哲学与代码规范。',
    fileName: 'moyun-design-spec.pdf',
    filePath: '/uploads/moyun-design-spec.pdf',
    fileSize: 3145728,
    fileType: 'application/pdf',
    category: '技术文档',
    downloadCount: 19,
  },
];

for (const dl of initialDownloads) {
  // Only register demo resources when their actual files have been supplied.
  if (!fs.existsSync(path.join(process.env.UPLOAD_DIR || 'public/uploads', dl.fileName))) continue;
  const existing = sqlite.prepare('SELECT id FROM downloads WHERE file_name = ?').get(dl.fileName);
  if (!existing) {
    sqlite.prepare(`
      INSERT INTO downloads (title, description, file_name, file_path, file_size, file_type, category, download_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(dl.title, dl.description, dl.fileName, dl.filePath, dl.fileSize, dl.fileType, dl.category, dl.downloadCount);
  }
}
console.log('📦 Downloads seeded');

sqlite.close();
console.log('✨ Database initialization and seed completed successfully!');
