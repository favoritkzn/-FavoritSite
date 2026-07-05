'use client';

import { UserRole } from '@favorit/types';
import { Card, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { useDashboard } from '@/hooks/useDashboard';
import type { AdminDashboardStats } from '@/hooks/useDashboard';
import styles from '@/styles/cabinet.module.css';

export default function AdminStatisticsPage() {
  const { data: stats, isLoading } = useDashboard();
  const admin = stats as AdminDashboardStats | undefined;

  const chartData = admin
    ? [
        { label: 'Дети', value: admin.childrenCount },
        { label: 'Родители', value: admin.parentsCount },
        { label: 'Тренеры', value: admin.coachesCount },
        { label: 'Группы', value: admin.groupsCount },
        { label: 'Абонементы', value: admin.activeSubscriptions },
        { label: 'Заявки', value: admin.trialRegistrations },
      ]
    : [];

  const maxVal = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <DashboardShell role={UserRole.ADMIN} title="Аналитика">
      <h1 className={styles.pageTitle}>Аналитика</h1>
      {isLoading ? (
        <Skeleton variant="rect" height={300} />
      ) : (
        <Card title="Обзор академии">
          <div className={styles.barChart} style={{ marginTop: 24 }}>
            {chartData.map((item) => (
              <div key={item.label} className={styles.barRow}>
                <span className={styles.barLabel}>{item.label}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${(item.value / maxVal) * 100}%` }}
                  />
                </div>
                <span className={styles.barValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </DashboardShell>
  );
}
