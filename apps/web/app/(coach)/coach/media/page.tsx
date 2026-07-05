'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

interface Album {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  _count?: { items: number };
}

export default function CoachMediaPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['media', 'albums', 'public'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Album[]>>('/media/albums/public', { auth: false });
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.COACH} title="Медиа">
      <h1 className={styles.pageTitle}>Фото и видео</h1>
      {isLoading && (
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rect" height={180} />)}
        </div>
      )}
      {isError && <EmptyState title="Не удалось загрузить медиа" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Альбомов пока нет" />}
      {data && data.length > 0 && (
        <div className={styles.grid}>
          {data.map((album) => (
            <Link key={album.id} href={`/gallery/${album.id}`} className={styles.listItem} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              {album.coverUrl ? (
                <img src={album.coverUrl} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
              ) : (
                <div style={{ fontSize: 48, textAlign: 'center' }}>📷</div>
              )}
              <div className={styles.listItemTitle}>{album.title}</div>
              {album._count && <div className={styles.listItemMeta}>{album._count.items} фото</div>}
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
