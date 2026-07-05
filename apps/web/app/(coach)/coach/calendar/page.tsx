'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import type { CoachMonthCalendar } from '@/hooks/useDashboard';
import { apiGet } from '@/lib/api';
import { formatDate, formatTimeRange } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

export default function CoachCalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['schedule', 'coach', 'month', year, month],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<CoachMonthCalendar>>(
        `/schedule/coach/month?year=${year}&month=${month}`,
      );
      return res.data!;
    },
  });

  function shiftMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  }

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <DashboardShell role={UserRole.COACH} title="Календарь">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Календарь</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button variant="secondary" size="sm" onClick={() => shiftMonth(-1)}>←</Button>
          <span style={{ minWidth: 140, textAlign: 'center', textTransform: 'capitalize' }}>{monthLabel}</span>
          <Button variant="secondary" size="sm" onClick={() => shiftMonth(1)}>→</Button>
        </div>
      </div>

      {isLoading && <Skeleton variant="rect" height={200} />}
      {isError && <EmptyState title="Не удалось загрузить календарь" />}

      {data && (
        <>
          <div className={styles.grid} style={{ marginBottom: 24 }}>
            <Card title="Тренировок">
              <p style={{ fontSize: 28, fontWeight: 700, margin: '8px 0 0' }}>{data.summary.totalSessions}</p>
            </Card>
            <Card title="Посещаемость">
              <p style={{ fontSize: 28, fontWeight: 700, margin: '8px 0 0' }}>{data.summary.averageAttendance}%</p>
            </Card>
            <Card title="Завершено">
              <p style={{ fontSize: 28, fontWeight: 700, margin: '8px 0 0' }}>{data.summary.completedSessions}</p>
            </Card>
          </div>

          {data.sessions.length === 0 ? (
            <EmptyState title="В этом месяце нет тренировок" />
          ) : (
            <div className={styles.list}>
              {data.sessions.map((s) => (
                <div key={s.id} className={styles.listItem}>
                  <div>
                    <div className={styles.listItemTitle}>{s.group.name}</div>
                    <div className={styles.listItemMeta}>
                      {formatDate(s.startTime)} · {formatTimeRange(s.startTime, s.endTime)}
                    </div>
                    <div className={styles.listItemMeta}>
                      {s.venue} · на месте {s.presentCount}/{s.rosterSize}
                    </div>
                  </div>
                  <Link href={`/coach/attendance/${s.id}`}>
                    <Button size="sm" variant="secondary">Отметить</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
