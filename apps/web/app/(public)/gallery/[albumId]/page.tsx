'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@favorit/types';
import { Button, EmptyState, Skeleton } from '@favorit/ui';
import { apiGet } from '@/lib/api';
import styles from '@/styles/public.module.css';

interface MediaItem {
  id: string;
  url: string;
  type: string;
  title: string | null;
  thumbnailUrl: string | null;
}

interface Album {
  id: string;
  title: string;
  description: string | null;
  items: MediaItem[];
}

export default function GalleryAlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = use(params);

  const { data: album, isLoading, isError } = useQuery({
    queryKey: ['media', 'albums', albumId],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Album>>(`/media/albums/${albumId}`, { auth: false });
      return res.data!;
    },
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Skeleton variant="title" width="40%" />
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rect" height={180} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !album) {
    return (
      <div className={styles.container}>
        <EmptyState title="Альбом не найден" action={<Link href="/gallery"><Button>К галерее</Button></Link>} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{album.title}</h1>
      {album.description && <p className={styles.subtitle}>{album.description}</p>}

      {album.items.length === 0 ? (
        <EmptyState title="В альбоме пока нет фото" />
      ) : (
        <div className={styles.grid}>
          {album.items.map((item) => (
            <div key={item.id} className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
              <img
                src={item.thumbnailUrl ?? item.url}
                alt={item.title ?? ''}
                style={{ width: '100%', height: 200, objectFit: 'cover' }}
              />
              {item.title && (
                <p style={{ padding: 12, fontSize: 14 }}>{item.title}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <Link href="/gallery"><Button variant="secondary">← К галерее</Button></Link>
      </div>
    </div>
  );
}
