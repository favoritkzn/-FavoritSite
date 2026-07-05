'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, EmptyState, ProgressBar, Skeleton } from '@favorit/ui';
import { ChildSwitcher } from '@/components/parent/ChildSwitcher';
import { DashboardShell } from '@/components/DashboardShell';
import { useDashboard } from '@/hooks/useDashboard';
import type { ParentDashboardStats } from '@/hooks/useDashboard';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { apiGet } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Subscription {
  id: string;
  status: string;
  remainingSessions: number;
  startDate: string;
  endDate: string;
  plan: { name: string; price: number; sessions: number };
}

export default function ParentSubscriptionPage() {
  const { data: dash } = useDashboard();
  const children = (dash as ParentDashboardStats | undefined)?.children ?? [];
  const { childId, setChildId } = useSelectedChild(children);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['subscriptions', childId],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Subscription[]>>(`/subscriptions/children/${childId}`);
      return res.data ?? [];
    },
    enabled: !!childId,
  });

  const active = data?.find((s) => s.status === 'ACTIVE');

  return (
    <DashboardShell role={UserRole.PARENT} title="Абонемент">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Абонемент</h1>
        <Link href="/parent/payments/new"><Button>Оплатить / продлить</Button></Link>
      </div>
      {!children.length && <EmptyState title="Нет привязанных детей" />}
      {children.length > 0 && (
        <ChildSwitcher children={children} value={childId} onChange={setChildId} />
      )}
      {childId && isLoading && <Skeleton variant="rect" height={200} />}
      {isError && <EmptyState title="Не удалось загрузить абонемент" />}
      {!isLoading && !active && childId && (
        <EmptyState title="Нет активного абонемента" description="Оформите абонемент в разделе «Оплата»" />
      )}
      {active && (
        <Card title={active.plan.name}>
          <ProgressBar value={active.remainingSessions} max={active.plan.sessions} label="Осталось тренировок" />
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className={styles.listItemMeta}>С {formatDate(active.startDate)} по {formatDate(active.endDate)}</span>
            <span className={styles.listItemMeta}>Стоимость: {formatPrice(active.plan.price)}</span>
          </div>
        </Card>
      )}
    </DashboardShell>
  );
}
