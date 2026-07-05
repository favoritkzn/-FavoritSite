'use client';

import type { ReactNode } from 'react';
import { UserRole } from '@favorit/types';
import { Skeleton } from '@favorit/ui';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useDashboard } from '@/hooks/useDashboard';
import { getFullName } from '@/lib/auth';
import styles from '@/styles/cabinet.module.css';

interface DashboardShellProps {
  role: UserRole;
  title?: string;
  children: ReactNode;
}

export function DashboardShell({ role, title = 'Личный кабинет', children }: DashboardShellProps) {
  const { data: user, isLoading: userLoading } = useAuthUser();
  const { data: dashboard } = useDashboard();

  const adminStats =
    role === UserRole.ADMIN && dashboard && 'trialRegistrations' in dashboard
      ? (dashboard as import('@/hooks/useDashboard').AdminDashboardStats)
      : null;

  const notificationCount =
    dashboard && 'unreadNotifications' in dashboard ? dashboard.unreadNotifications : 0;

  if (userLoading) {
    return (
      <div className={styles.loadingShell}>
        <Skeleton variant="rect" height={64} />
        <Skeleton variant="title" width="40%" />
        <Skeleton variant="rect" height={200} />
        <Skeleton variant="rect" height={200} />
      </div>
    );
  }

  return (
    <DashboardLayout
      role={role}
      userName={user ? getFullName(user) : 'Пользователь'}
      userAvatar={user?.avatar}
      notificationCount={notificationCount}
      trialCount={adminStats?.trialRegistrations ?? 0}
      pendingRegistrationsCount={adminStats?.pendingRegistrations ?? 0}
      title={title}
    >
      {children}
    </DashboardLayout>
  );
}
