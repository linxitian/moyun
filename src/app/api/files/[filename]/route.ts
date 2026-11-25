import { serveUpload } from '@/lib/uploads';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  return serveUpload(`/api/files/${encodeURIComponent(filename)}`);
}
