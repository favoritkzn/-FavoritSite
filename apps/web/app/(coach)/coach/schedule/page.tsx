'use client';

import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import { formatDate, formatTimeRange } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Session {
  id: string;
  title: string | null;
  venue: string;
  startTime: string;
  endTime: string;
  status: string;
  group: { name: string };
}

export default function CoachSchedulePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['schedule', 'my', 'coach'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Session[]>>('/schedule/my');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.COACH} title="Расписание">
      <h1 className={styles.pageTitle}>Моё расписание</h1>
      {isLoading && (
        <div className={styles.skeletonList}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rect" height={72} />)}
        </div>
      )}
      {isError && <EmptyState title="Не удалось загрузить расписание" />}
      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState title="Нет занятий" description="Администратор добавит тренировки в расписание" />
      )}
      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((s) => (
            <div key={s.id} className={styles.listItem}>
              <div>
                <div className={styles.listItemTitle}>{s.title ?? 'Тренировка'} · {s.group.name}</div>
                <div className={styles.listItemMeta}>
                  {formatDate(s.startTime)} · {formatTimeRange(s.startTime, s.endTime)}
                </div>
                <div className={styles.listItemMeta}>{s.venue}</div>
              </div>
              <Badge variant={s.status === 'CANCELLED' ? 'error' : 'primary'}>{s.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
