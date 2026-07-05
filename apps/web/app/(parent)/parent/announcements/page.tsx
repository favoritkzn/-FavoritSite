'use client';

import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  group: { name: string };
  author: { firstName: string; lastName: string };
}

export default function ParentAnnouncementsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['announcements', 'my'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Announcement[]>>('/announcements/my');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.PARENT} title="Объявления">
      <h1 className={styles.pageTitle}>Объявления от тренеров</h1>
      {isLoading && (
        <div className={styles.skeletonList}>
          {[1, 2].map((i) => <Skeleton key={i} variant="rect" height={80} />)}
        </div>
      )}
      {isError && <EmptyState title="Не удалось загрузить объявления" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Объявлений пока нет" />}
      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((a) => (
            <div key={a.id} className={styles.listItem} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div className={styles.listItemTitle}>{a.title}</div>
              <div className={styles.listItemMeta}>
                {a.group.name} · {formatDate(a.createdAt)}
              </div>
              <p style={{ margin: '12px 0 0', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{a.content}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
