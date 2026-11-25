import path from 'node:path';
import fs from 'node:fs';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';

// Mutable uploads live on disk at runtime and must not be traced into a build.
export const uploadsDir = path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads'));
export const maxUploadBytes = 25 * 1024 * 1024;

export function resolveUpload(filePath: string): string | null {
  const prefix = ['/api/files/', '/uploads/'].find((value) => filePath.startsWith(value));
  if (!prefix) return null;
  let filename: string;
  try { filename = decodeURIComponent(filePath.slice(prefix.length)); } catch { return null; }
  if (!filename || filename === '.' || filename === '..' || /[\\/\0]/.test(filename)) return null;
  try {
    const resolved = fs.realpathSync(/* turbopackIgnore: true */ path.join(/* turbopackIgnore: true */ uploadsDir, filename));
    if (path.dirname(resolved) !== fs.realpathSync(/* turbopackIgnore: true */ uploadsDir) || !fs.statSync(/* turbopackIgnore: true */ resolved).isFile()) return null;
    return resolved;
  } catch { return null; }
}

export function isDownloadAvailable(filePath: string): boolean {
  return /^https?:\/\//i.test(filePath) || resolveUpload(filePath) !== null;
}

export function serveUpload(filePath: string, downloadName?: string): Response {
  const file = resolveUpload(filePath);
  if (!file) return Response.json({ error: '文件不存在或已移除' }, { status: 404 });
  const imageTypes: Record<string, string> = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif', '.ico': 'image/x-icon',
  };
  const imageType = imageTypes[path.extname(file).toLowerCase()];
  const attachment = !!downloadName || !imageType;
  const filename = encodeURIComponent(downloadName || path.basename(file)).replace(/'/g, '%27');
  return new Response(Readable.toWeb(createReadStream(/* turbopackIgnore: true */ file)) as ReadableStream<Uint8Array>, {
    headers: {
      'Content-Type': imageType || 'application/octet-stream',
      'Content-Length': String(fs.statSync(/* turbopackIgnore: true */ file).size),
      'Content-Disposition': `${attachment ? 'attachment' : 'inline'}; filename*=UTF-8''${filename}`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}
