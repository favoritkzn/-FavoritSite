/** @type {import('next').NextConfig} */
const path = require('path');

const apiUrl = process.env.API_URL || 'http://localhost:4000';

function parseRemotePattern(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
    };
  } catch {
    return null;
  }
}

const imagePatterns = [
  { protocol: 'http', hostname: 'localhost', port: '9000' },
  { protocol: 'http', hostname: 'localhost', port: '4000' },
  { protocol: 'http', hostname: '127.0.0.1', port: '4000' },
  parseRemotePattern(process.env.S3_ENDPOINT),
  parseRemotePattern(process.env.NEXT_PUBLIC_S3_URL),
  parseRemotePattern(process.env.NEXT_PUBLIC_APP_URL),
].filter(Boolean);

const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../..'),
  transpilePackages: ['@favorit/ui', '@favorit/types'],
  images: {
    remotePatterns: imagePatterns,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
