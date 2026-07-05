'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import { formatDate, formatTimeRange } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Session {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string;
  group: { name: string };
  status: string;
}

export default function CoachAttendancePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['schedule', 'my', 'attendance'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Session[]>>('/schedule/my');
      return res.data ?? [];
    },
  });

  const markable =
    data?.filter((s) => {
      if (s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS') return true;
      if (s.status === 'COMPLETED') {
        return new Date(s.startTime) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }
      return false;
    }) ?? [];

  return (
    <DashboardShell role={UserRole.COACH} title="Посещаемость">
      <h1 className={styles.pageTitle}>Посещаемость</h1>
      <p className={styles.listItemMeta} style={{ marginBottom: 24 }}>
        Выберите тренировку для отметки присутствия
      </p>
      {isLoading && (
        <div className={styles.skeletonList}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rect" height={72} />)}
        </div>
      )}
      {isError && <EmptyState title="Не удалось загрузить занятия" />}
      {!isLoading && markable.length === 0 && <EmptyState title="Нет занятий для отметки" />}
      {markable.length > 0 && (
        <div className={styles.list}>
          {markable.map((s) => (
            <div key={s.id} className={styles.listItem}>
              <div>
                <div className={styles.listItemTitle}>{s.group.name}</div>
                <div className={styles.listItemMeta}>
                  {formatDate(s.startTime)} · {formatTimeRange(s.startTime, s.endTime)}
                </div>
              </div>
              <Link href={`/coach/attendance/${s.id}`}>
                <Button>Отметить</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
