'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  publishedAt: string | null;
}

export default function AdminNewsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['news', 'admin'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<NewsItem[]>>('/news');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Новости">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Новости</h1>
        <Link href="/admin/news/new"><Button>Добавить</Button></Link>
      </div>
      {isLoading && <div className={styles.skeletonList}>{[1, 2].map((i) => <Skeleton key={i} variant="rect" height={60} />)}</div>}
      {isError && <EmptyState title="Не удалось загрузить" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Нет новостей" />}
      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((n) => (
            <div key={n.id} className={styles.listItem}>
              <div>
                <div className={styles.listItemTitle}>{n.title}</div>
                <div className={styles.listItemMeta}>
                  {n.publishedAt ? formatDate(n.publishedAt) : 'Черновик'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge variant={n.isPublished ? 'success' : 'default'}>
                  {n.isPublished ? 'Опубликовано' : 'Черновик'}
                </Badge>
                <Link href={`/admin/news/${n.id}/edit`} style={{ fontSize: 14, color: 'var(--color-primary)' }}>
                  Редактировать
                </Link>
                <Link href={`/news/${n.slug}`} style={{ fontSize: 14, color: 'var(--color-primary)' }}>
                  Просмотр
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
