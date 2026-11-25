import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  output: process.env.NEXT_STANDALONE === '1' ? 'standalone' : undefined,
  outputFileTracingExcludes: {
    '/*': ['./.local/**/*', './data/**/*', './public/uploads/**/*', './.env*'],
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  serverExternalPackages: ['better-sqlite3'],
  async rewrites() {
    return {
      beforeFiles: [{ source: '/uploads/:filename', destination: '/api/files/:filename' }],
    };
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    }];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
