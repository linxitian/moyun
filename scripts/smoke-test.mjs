import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import Database from 'better-sqlite3';

const dist = process.env.NEXT_DIST_DIR || '.next-production';
assert.ok(fs.existsSync(path.join(dist, 'BUILD_ID')), `Build first: NEXT_DIST_DIR=${dist} npm run build`);
fs.mkdirSync('.local', { recursive: true, mode: 0o700 });
const directory = fs.mkdtempSync(path.resolve('.local/smoke-'));
const listener = net.createServer();
await new Promise((resolve, reject) => { listener.once('error', reject); listener.listen(0, '127.0.0.1', resolve); });
const port = listener.address().port;
await new Promise((resolve) => listener.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const password = randomBytes(24).toString('base64url');
const env = {
  ...process.env, NODE_ENV: 'production', NEXT_DIST_DIR: dist,
  DATABASE_PATH: path.join(directory, 'test.db'), UPLOAD_DIR: path.join(directory, 'uploads'),
  NEXTAUTH_SECRET: randomBytes(48).toString('base64url'), AUTH_SECRET: randomBytes(48).toString('base64url'),
  NEXTAUTH_URL: origin, AUTH_URL: origin, AUTH_TRUST_HOST: 'true', ADMIN_PASSWORD: password,
};
let server;
let log = '';
let db;
let checks = 0;
function check(condition, message) { assert.ok(condition, message); checks++; console.log(`PASS ${message}`); }
function seed() {
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/seed.ts'], { env, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}
const cookies = new Map();
async function request(url, options = {}, authenticated = false) {
  const headers = new Headers(options.headers);
  if (authenticated) headers.set('cookie', [...cookies].map(([key, value]) => `${key}=${value}`).join('; '));
  const response = await fetch(`${origin}${url}`, { ...options, headers, redirect: 'manual' });
  if (authenticated) {
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(';');
      const index = pair.indexOf('=');
      cookies.set(pair.slice(0, index), pair.slice(index + 1));
    }
  }
  return response;
}
const json = (body, method = 'POST') => ({ method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

try {
  seed();
  db = new Database(env.DATABASE_PATH);
  db.prepare("UPDATE settings SET value = '保留自定义站点名' WHERE key = 'siteName'").run();
  const tagCount = db.prepare('SELECT count(*) AS n FROM post_tags').get().n;
  seed(); seed();
  check(db.prepare("SELECT value FROM settings WHERE key = 'siteName'").get().value === '保留自定义站点名', 'Repeated seed preserves site settings');
  check(db.prepare('SELECT count(*) AS n FROM post_tags').get().n === tagCount, 'Repeated seed does not duplicate article tags');
  check(db.prepare('SELECT count(*) AS n FROM downloads').get().n === 0, 'Seed skips missing demo downloads');

  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', (value) => { log += value; });
  server.stderr.on('data', (value) => { log += value; });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(log);
    try { if ((await request('/api/auth/csrf')).ok) break; } catch { /* Server starting. */ }
    if (attempt === 99) throw new Error(`Server did not start\n${log}`);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  for (const url of ['/', '/blog', '/nav', '/archive', '/about', '/admin/login']) {
    const response = await request(url);
    check(response.status === 200, `${url} renders successfully`);
  }
  check((await (await request('/')).text()).includes('保留自定义站点名'), 'Configured brand renders on the homepage');
  check((await request('/admin')).status === 307, 'Anonymous visitors are redirected from admin');
  for (const url of ['/api/posts', '/api/bookmarks', '/api/downloads', '/api/categories', '/api/tags', '/api/upload']) {
    check((await request(url, json({}))).status === 401, `${url} rejects anonymous writes`);
  }
  const csrf = await (await request('/api/auth/csrf', {}, true)).json();
  const login = await request('/api/auth/callback/credentials', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', 'X-Auth-Return-Redirect': '1' },
    body: new URLSearchParams({ csrfToken: csrf.csrfToken, username: 'admin', password, callbackUrl: `${origin}/admin` }),
  }, true);
  check(login.ok && (await (await request('/api/auth/session', {}, true)).json()).user?.role === 'admin', 'Admin can log in with the generated password');

  const created = await request('/api/posts', json({ title: '回归测试草稿', slug: 'regression-draft', content: 'DRAFT_PRIVATE_MARKER', status: 'draft' }), true);
  check(created.status === 201, 'Admin can create a draft');
  const post = (await created.json()).post;
  for (const url of [`/api/posts/${post.id}`, '/api/posts/regression-draft', '/blog/regression-draft']) {
    check((await request(url)).status === 404, `${url} hides draft content from visitors`);
  }
  for (const status of ['all', 'draft']) {
    const payload = await (await request(`/api/posts?status=${status}`)).json();
    check(payload.posts.every((item) => item.status === 'published'), `Anonymous status=${status} never exposes drafts`);
  }
  check((await (await request('/api/posts?status=all', {}, true)).json()).posts.some((item) => item.id === post.id), 'Admin can list drafts');
  check((await request(`/api/posts/${post.id}`, json({ status: 'published' }, 'PUT'), true)).ok, 'Admin can publish a draft');
  check((await request('/blog/regression-draft')).status === 200, 'Published article becomes visible');
  check((await request(`/api/posts/${post.id}`, json({ status: 'draft' }, 'PUT'), true)).ok, 'Admin can unpublish an article');
  check((await request('/blog/regression-draft')).status === 404, 'Unpublishing hides the previously visible page');

  const form = new FormData();
  form.set('file', new File(['download-test-bytes'], '回归测试.txt', { type: 'text/plain' }));
  const upload = await request('/api/upload', { method: 'POST', body: form }, true);
  check(upload.ok, 'Authenticated upload succeeds');
  const file = await upload.json();
  check((await (await request(file.url)).text()) === 'download-test-bytes', 'A new upload is readable without restarting the production server');
  const download = await (await request('/api/downloads', json({ title: '回归测试文件', fileName: file.fileName, filePath: file.url }), true)).json();
  const fetched = await request(`/api/downloads/${download.download.id}/file`);
  check(fetched.ok && (await fetched.text()) === 'download-test-bytes', 'Download returns the original file bytes');
  check(fetched.headers.get('content-disposition').startsWith('attachment'), 'Downloads have an attachment filename');
  check(db.prepare('SELECT download_count FROM downloads WHERE id = ?').get(download.download.id).download_count === 1, 'Successful download increments its counter');
  check((await request(`/api/downloads/${download.download.id}/file`, { method: 'HEAD' })).ok, 'HEAD can inspect a downloadable file');
  check(db.prepare('SELECT download_count FROM downloads WHERE id = ?').get(download.download.id).download_count === 1, 'HEAD requests do not inflate download counts');
  const unsafeForm = new FormData();
  unsafeForm.set('file', new File(['<script>alert(1)</script>'], 'test.html', { type: 'text/html' }));
  const unsafeUpload = await (await request('/api/upload', { method: 'POST', body: unsafeForm }, true)).json();
  const unsafeResponse = await request(unsafeUpload.url);
  check(unsafeResponse.headers.get('content-disposition').startsWith('attachment') && unsafeResponse.headers.get('content-type') === 'application/octet-stream', 'Active HTML uploads are downloaded as attachments');
  const legacyUpload = await request(`/uploads/${encodeURIComponent(unsafeUpload.savedFileName)}`);
  check(legacyUpload.ok && legacyUpload.headers.get('content-disposition')?.startsWith('attachment') && legacyUpload.headers.get('content-type') === 'application/octet-stream', 'Legacy upload URLs cannot bypass attachment protection');
  db.prepare('UPDATE downloads SET file_path = ? WHERE id = ?').run('/uploads/missing.txt', download.download.id);
  check((await request(`/api/downloads/${download.download.id}/file`)).status === 404, 'Missing file returns 404');
  check(db.prepare('SELECT download_count FROM downloads WHERE id = ?').get(download.download.id).download_count === 1, 'Missing file does not increment its counter');
  check((await request('/api/files/..%2Ftest.db')).status === 404, 'File traversal cannot read the database');
  check((await request('/api/upload', { method: 'POST', body: new FormData() }, true)).status === 400, 'Empty upload is rejected');
  const oversizeForm = new FormData();
  oversizeForm.set('file', new File([new Uint8Array(25 * 1024 * 1024 + 1)], 'large.bin'));
  check((await request('/api/upload', { method: 'POST', body: oversizeForm }, true)).status === 413, 'Uploads larger than 25 MB are rejected');

  check((await request('/api/settings', json({ siteName: '测试更新品牌', siteDescription: '测试更新介绍' }, 'PUT'), true)).ok, 'Admin can update site settings');
  const home = await (await request('/')).text();
  check(home.includes('测试更新品牌') && home.includes('测试更新介绍'), 'Updated settings appear on the site immediately');
  console.log(`\n${checks} smoke checks passed; live content was not modified.`);
} catch (error) {
  console.error(error);
  console.error(log.slice(-6000));
  process.exitCode = 1;
} finally {
  if (server && server.exitCode === null) {
    const stopped = once(server, 'exit');
    server.kill('SIGTERM');
    await stopped;
  }
  db?.close();
  fs.rmSync(directory, { recursive: true, force: true });
}
