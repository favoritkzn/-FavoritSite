'use client';

import Link from 'next/link';
import { UserRole } from '@favorit/types';
import { Card, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { useDashboard, type CoachDashboardStats } from '@/hooks/useDashboard';
import styles from '@/styles/cabinet.module.css';

export default function CoachGroupsPage() {
  const { data, isLoading, isError } = useDashboard();
  const coach = data as CoachDashboardStats | undefined;
  const groups = coach?.groups ?? [];

  return (
    <DashboardShell role={UserRole.COACH} title="Группы">
      <h1 className={styles.pageTitle}>Мои группы</h1>
      {isLoading && (
        <div className={styles.grid}>
          {[1, 2].map((i) => <Skeleton key={i} variant="rect" height={100} />)}
        </div>
      )}
      {isError && <EmptyState title="Не удалось загрузить группы" />}
      {!isLoading && groups.length === 0 && (
        <EmptyState title="Групп пока нет" description="Администратор назначит вас тренером группы" />
      )}
      {groups.length > 0 && (
        <div className={styles.grid}>
          {groups.map((g) => (
            <Link key={g.id} href={`/coach/groups/${g.id}`}>
              <Card title={g.name} hoverable>
                <p className={styles.listItemMeta}>
                  Учеников: {g._count?.children ?? '—'}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
