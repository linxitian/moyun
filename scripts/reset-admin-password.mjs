import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());
const db = new Database(path.resolve(process.env.DATABASE_PATH || 'data/moyun.db'), { fileMustExist: true });
try {
  const user = db.prepare("SELECT id FROM users WHERE username = 'admin' AND role = 'admin'").get();
  if (!user) throw new Error('No admin account found; run npm run db:seed first.');
  const password = randomBytes(24).toString('base64url');
  fs.mkdirSync('.local', { recursive: true, mode: 0o700 });
  const credentials = path.resolve('.local/admin-credentials.txt');
  // Save first so a filesystem failure cannot leave an unknown password in the database.
  fs.writeFileSync(credentials, `用户名：admin\n密码：${password}\n`, { mode: 0o600 });
  fs.chmodSync(credentials, 0o600);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(password, 12), user.id);
  console.log(`Admin password reset. Credentials saved: ${credentials}`);
} finally { db.close(); }
