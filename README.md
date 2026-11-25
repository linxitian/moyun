# Moyun

An ink-wash (水墨) styled personal website system: a blog, a curated link collection, file downloads, and a practical admin dashboard. This is the live source code behind [linxitian.com](https://linxitian.com).

[简体中文](README.zh-CN.md)

## Features

- **Blog**: Markdown / MDX writing with categories and tags, an archive page, full-text search, a reading progress bar, code highlighting, and pinned posts
- **Curated navigation**: a categorized bookmark collection, managed from the admin dashboard
- **Downloads**: file upload and download management
- **Admin dashboard** (`/admin`): posts, navigation links, downloads, and site settings (site info, author profile, and more) — all editable without touching the database
- **Interface**: an ink-wash inspired UI (ink backgrounds, seal stamps, mountain-silhouette components), with dark mode and responsive mobile support

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Drizzle ORM + SQLite (better-sqlite3) — a single-file database, simple to deploy
- NextAuth v5 for authentication, bcryptjs password hashing
- next-mdx-remote + remark-gfm + rehype-highlight for rendering post content

## Quick start

Requires Node.js 20+.

```bash
npm install
cp .env.example .env   # set AUTH_SECRET to a random string, at minimum
npm run db:push        # create the tables
npm run db:seed        # seed demo data and create the admin account
npm run dev            # http://localhost:3000
```

The admin account is created during seeding: its password comes from the `ADMIN_PASSWORD` environment variable; if unset, a random password is generated and written to `.local/admin-credentials.txt`. If you forget the password, reset it with `npm run admin:password`.

## Configuration

See `.env.example` for all environment variables. Only `AUTH_SECRET` is required; everything else has a default:

| Variable | Description | Default |
| --- | --- | --- |
| `DATABASE_PATH` | Path to the SQLite database | `data/moyun.db` |
| `UPLOAD_DIR` | Directory for uploaded files | `public/uploads` |
| `AUTH_SECRET` | NextAuth secret | none, required |
| `ADMIN_PASSWORD` | Admin password used by the seed script | randomly generated |

## Docker

The repository ships a Dockerfile, so one pair of commands is enough:

```bash
docker build -t moyun .
docker run -d -p 3000:3000 -e AUTH_SECRET=change-me-to-a-random-string moyun
```

## Project structure

```
src/
├── app/          # Pages and API routes (blog, navigation, downloads, admin)
├── components/   # UI components, including the ink-wash styled ones
└── lib/          # Database, auth, MDX, uploads, and other core logic
content/posts/    # Sample posts
scripts/          # Seed, backup, password reset, and smoke-test scripts
```

## License

[MIT](LICENSE)
