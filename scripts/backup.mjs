import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import Database from 'better-sqlite3';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());
const destination = path.resolve('.local/backups', new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(destination, { recursive: true, mode: 0o700 });
const db = new Database(path.resolve(process.env.DATABASE_PATH || 'data/moyun.db'), { readonly: true });
try {
  await db.backup(path.join(destination, 'moyun.db'));
} finally { db.close(); }
fs.chmodSync(path.join(destination, 'moyun.db'), 0o600);
const uploads = path.resolve(process.env.UPLOAD_DIR || 'public/uploads');
if (fs.existsSync(uploads)) {
  const result = spawnSync('tar', ['-czf', path.join(destination, 'uploads.tar.gz'), '-C', uploads, '.'], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'Upload backup failed');
  fs.chmodSync(path.join(destination, 'uploads.tar.gz'), 0o600);
}
console.log(`Backup saved: ${destination}`);
