'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

interface Album {
  id: string;
  title: string;
  isPublic: boolean;
  _count?: { items: number };
}

export default function AdminMediaPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['media', 'albums', 'admin'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Album[]>>('/media/albums');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Медиа">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Медиаальбомы</h1>
        <Link href="/admin/media/new"><Button>Новый альбом</Button></Link>
      </div>
      {isLoading && <div className={styles.grid}>{[1, 2].map((i) => <Skeleton key={i} variant="rect" height={80} />)}</div>}
      {isError && <EmptyState title="Не удалось загрузить" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Нет альбомов" />}
      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((a) => (
            <Link key={a.id} href={`/admin/media/${a.id}`} className={styles.listItem}>
              <div>
                <div className={styles.listItemTitle}>{a.title}</div>
                <div className={styles.listItemMeta}>{a._count?.items ?? 0} фото</div>
              </div>
              <Badge variant={a.isPublic ? 'success' : 'default'}>
                {a.isPublic ? 'Публичный' : 'Скрытый'}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
