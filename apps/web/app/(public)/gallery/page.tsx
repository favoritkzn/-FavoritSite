'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@favorit/types';
import { EmptyState, Skeleton } from '@favorit/ui';
import { apiGet } from '@/lib/api';
import styles from '@/styles/public.module.css';

interface Album {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  _count?: { items: number };
}

export default function GalleryPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['media', 'albums', 'public'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Album[]>>('/media/albums/public', { auth: false });
      return res.data ?? [];
    },
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Галерея</h1>
      <p className={styles.subtitle}>Фото и видео с тренировок и матчей</p>

      {isLoading && (
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rect" height={200} />
          ))}
        </div>
      )}

      {isError && <EmptyState title="Не удалось загрузить галерею" />}

      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState title="Альбомов пока нет" />
      )}

      {data && data.length > 0 && (
        <div className={styles.grid}>
          {data.map((album) => (
            <Link key={album.id} href={`/gallery/${album.id}`} className={styles.card}>
              {album.coverUrl ? (
                <img
                  src={album.coverUrl}
                  alt=""
                  style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                />
              ) : (
                <div style={{ fontSize: 48, marginBottom: 12, textAlign: 'center' }}>📷</div>
              )}
              <h3 className={styles.cardTitle}>{album.title}</h3>
              {album.description && <p className={styles.cardMeta}>{album.description}</p>}
              {album._count && (
                <p className={styles.cardMeta}>{album._count.items} фото</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
