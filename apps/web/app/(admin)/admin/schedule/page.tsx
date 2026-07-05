'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, EmptyState, Skeleton } from '@favorit/ui';
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

export default function AdminSchedulePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['schedule', 'all'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Session[]>>('/schedule');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Расписание">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Расписание</h1>
        <Link href="/admin/schedule/new"><Button>Добавить занятие</Button></Link>
      </div>
      {isLoading && <div className={styles.skeletonList}>{[1, 2, 3].map((i) => <Skeleton key={i} variant="rect" height={72} />)}</div>}
      {isError && <EmptyState title="Не удалось загрузить" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Нет занятий" />}
      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((s) => (
            <Link key={s.id} href={`/admin/schedule/${s.id}/edit`} className={styles.listItem}>
              <div>
                <div className={styles.listItemTitle}>{s.title ?? 'Тренировка'} · {s.group.name}</div>
                <div className={styles.listItemMeta}>
                  {formatDate(s.startTime)} · {formatTimeRange(s.startTime, s.endTime)} · {s.venue}
                </div>
              </div>
              <Badge variant="primary">{s.status}</Badge>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
