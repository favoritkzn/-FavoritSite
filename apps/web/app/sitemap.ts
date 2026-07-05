import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '', '/about', '/coaches', '/schedule', '/pricing', '/news', '/gallery',
    '/contacts', '/shop', '/login', '/register', '/privacy', '/terms',
  ];

  return staticPages.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/news' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
