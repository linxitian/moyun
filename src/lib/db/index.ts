import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

// Runtime database is backed up separately, never bundled into a deployment.
const dbPath = path.resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'moyun.db'));

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

declare global {
  var _sqlite: Database.Database | undefined;
}

const sqlite = global._sqlite || new Database(dbPath);
if (process.env.NODE_ENV !== 'production') {
  global._sqlite = sqlite;
}

sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export { sqlite };
