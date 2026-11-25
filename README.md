# 墨韵 Moyun

一套水墨风格的个人网站系统：博客、精选导航、资源下载，再加一个够用的管理后台。是 [linxitian.com](https://linxitian.com) 的线上源码。

## 功能

- **博客**：Markdown / MDX 写作，分类与标签、归档页、全文搜索、阅读进度、代码高亮，支持置顶
- **精选导航**：按分类整理的网址书签，后台增删改
- **资源下载**：文件上传与下载管理
- **管理后台**（`/admin`）：文章、导航、下载、系统配置（站点信息、博主资料等）全在里面改，不用碰数据库
- **界面**：水墨意境 UI（水墨背景、印章、山影组件），支持深色模式和移动端适配

## 技术栈

- Next.js 16（App Router） + React 19 + TypeScript
- Tailwind CSS 4
- Drizzle ORM + SQLite（better-sqlite3），单文件数据库，部署简单
- NextAuth v5 登录鉴权，bcryptjs 密码哈希
- next-mdx-remote + remark-gfm + rehype-highlight 渲染正文

## 快速开始

需要 Node.js 20+。

```bash
npm install
cp .env.example .env   # 至少把 AUTH_SECRET 改成随机字符串
npm run db:push        # 建表
npm run db:seed        # 写入示例数据并创建管理员
npm run dev            # http://localhost:3000
```

管理员账号在种子阶段创建：密码取自环境变量 `ADMIN_PASSWORD`；不设置则自动生成随机密码，并写入 `.local/admin-credentials.txt`。忘记密码时用 `npm run admin:password` 重置。

## 配置

环境变量见 `.env.example`，只有 `AUTH_SECRET` 是必填，其余都有默认值：

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `DATABASE_PATH` | SQLite 数据库路径 | `data/moyun.db` |
| `UPLOAD_DIR` | 上传文件目录 | `public/uploads` |
| `AUTH_SECRET` | NextAuth 密钥 | 无，必填 |
| `ADMIN_PASSWORD` | 种子脚本的管理员密码 | 随机生成 |

## Docker

仓库带 Dockerfile，一条命令就能跑：

```bash
docker build -t moyun .
docker run -d -p 3000:3000 -e AUTH_SECRET=你的随机字符串 -v moyun-data:/app/data moyun
```

## 目录结构

```
src/
├── app/          # 页面与 API 路由（博客、导航、下载、后台）
├── components/   # UI 组件（含水墨风格组件）
└── lib/          # 数据库、鉴权、MDX、上传等基础逻辑
content/posts/    # 示例文章
scripts/          # 种子、备份、重置密码、冒烟测试脚本
```

## 协议

[MIT](LICENSE)
