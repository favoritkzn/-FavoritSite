'use client';

import Link from 'next/link';
import { UserRole } from '@favorit/types';
import { Button, Card, EmptyState, Skeleton } from '@favorit/ui';
import { ClipboardCheck, Swords } from 'lucide-react';
import { DashboardShell } from '@/components/DashboardShell';
import { useDashboard } from '@/hooks/useDashboard';
import type { CoachDashboardStats } from '@/hooks/useDashboard';
import { getGreeting } from '@/lib/auth';
import { useAuthUser } from '@/hooks/useAuthUser';
import { formatDate, formatTimeRange } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

export default function CoachDashboardPage() {
  const { data: user } = useAuthUser();
  const { data: stats, isLoading } = useDashboard();
  const coachStats = stats as CoachDashboardStats | undefined;

  return (
    <DashboardShell role={UserRole.COACH} title="Главная">
      <h1 className={styles.pageTitle}>{getGreeting()}, {user?.firstName ?? 'Тренер'}!</h1>
      <p className={styles.listItemMeta} style={{ marginBottom: 24 }}>
        Отмечайте присутствие на тренировках и записывайте результаты матчей.
      </p>
      {isLoading ? (
        <Skeleton variant="rect" height={120} />
      ) : (
        <>
          <Card title="Ближайшая тренировка">
            {coachStats?.nextSession ? (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontWeight: 600 }}>{coachStats.nextSession.group.name}</p>
                <p className={styles.listItemMeta}>
                  {formatDate(coachStats.nextSession.startTime)} ·{' '}
                  {formatTimeRange(coachStats.nextSession.startTime, coachStats.nextSession.endTime)}
                </p>
                {coachStats.nextSession.venue && (
                  <p className={styles.listItemMeta}>{coachStats.nextSession.venue}</p>
                )}
                <Link href="/coach/attendance" style={{ marginTop: 16, display: 'inline-block' }}>
                  <Button>Отметить посещаемость</Button>
                </Link>
              </div>
            ) : (
              <EmptyState title="Нет занятий" description="Администратор добавит тренировки в расписание" />
            )}
          </Card>
          <div style={{ marginTop: 24, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <Link href="/coach/attendance">
              <Card title="Посещаемость" hoverable>
                <ClipboardCheck size={24} style={{ marginBottom: 8, color: 'var(--color-primary)' }} />
                <p className={styles.listItemMeta}>Кто пришёл на тренировку</p>
              </Card>
            </Link>
            <Link href="/coach/matches">
              <Card title="Матчи" hoverable>
                <Swords size={24} style={{ marginBottom: 8, color: 'var(--color-primary)' }} />
                <p className={styles.listItemMeta}>Счёт и кто забил</p>
              </Card>
            </Link>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
