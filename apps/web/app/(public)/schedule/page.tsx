'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@favorit/types';
import { Badge, EmptyState, Skeleton } from '@favorit/ui';
import { apiGet } from '@/lib/api';
import { formatDate, formatTimeRange } from '@/lib/format';
import styles from '@/styles/public.module.css';

interface Session {
  id: string;
  title: string | null;
  venue: string;
  startTime: string;
  endTime: string;
  group: { name: string };
}

export default function PublicSchedulePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['schedule', 'public'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Session[]>>('/schedule/public', { auth: false });
      return res.data ?? [];
    },
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Расписание</h1>
      <p className={styles.subtitle}>
        Актуальное расписание открытых тренировок. Точное время и место
        вашей группы — в личном кабинете после записи
      </p>

      {isLoading && (
        <div className={styles.list}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rect" height={72} />
          ))}
        </div>
      )}

      {isError && <EmptyState title="Не удалось загрузить расписание" />}

      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState title="Расписание пока пусто" description="Следите за обновлениями" />
      )}

      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((session) => (
            <div key={session.id} className={styles.listItem}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {session.title ?? 'Тренировка'} · {session.group.name}
                </div>
                <div className={styles.cardMeta}>
                  {formatDate(session.startTime)} · {formatTimeRange(session.startTime, session.endTime)}
                </div>
                <div className={styles.cardMeta}>{session.venue}</div>
              </div>
              <Badge variant="primary">Тренировка</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
