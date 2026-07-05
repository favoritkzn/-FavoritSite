'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet, apiPatch } from '@/lib/api';
import { formatDate } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link: string | null;
}

export default function CoachNotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Notification[]>>('/notifications');
      return res.data ?? [];
    },
  });

  const markAll = useMutation({
    mutationFn: () => apiPatch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <DashboardShell role={UserRole.COACH} title="Уведомления">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className={styles.pageTitle}>Уведомления</h1>
        {data && data.some((n) => !n.isRead) && (
          <Button variant="secondary" size="sm" loading={markAll.isPending} onClick={() => markAll.mutate()}>
            Прочитать все
          </Button>
        )}
      </div>
      {isLoading && (
        <div className={styles.skeletonList}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rect" height={72} />)}
        </div>
      )}
      {isError && <EmptyState title="Не удалось загрузить уведомления" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Уведомлений нет" />}
      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((n) => (
            <div key={n.id} className={styles.listItem} style={{ opacity: n.isRead ? 0.7 : 1 }}>
              <div>
                <div className={styles.listItemTitle}>{n.title}</div>
                <div className={styles.listItemMeta}>{n.message}</div>
                <div className={styles.listItemMeta}>{formatDate(n.createdAt)}</div>
              </div>
              {!n.isRead && <Badge variant="primary">Новое</Badge>}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
