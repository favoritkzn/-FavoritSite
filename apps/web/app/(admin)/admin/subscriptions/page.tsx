'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import { formatDate, formatPrice, fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Subscription {
  id: string;
  status: string;
  remainingSessions: number;
  startDate: string;
  endDate: string;
  child: { firstName: string; lastName: string };
  plan: { name: string; price: number };
}

export default function AdminSubscriptionsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['subscriptions', 'all'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Subscription[]>>('/subscriptions');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Абонементы">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Абонементы</h1>
        <Link href="/admin/subscriptions/assign"><Button>Назначить</Button></Link>
      </div>
      {isLoading && <div className={styles.skeletonList}>{[1, 2].map((i) => <Skeleton key={i} variant="rect" height={60} />)}</div>}
      {isError && <EmptyState title="Не удалось загрузить" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Нет абонементов" />}
      {data && data.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ученик</th>
              <th>Тариф</th>
              <th>Статус</th>
              <th>Осталось</th>
              <th>До</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id}>
                <td>{fullName(s.child.firstName, s.child.lastName)}</td>
                <td>{s.plan.name} ({formatPrice(s.plan.price)})</td>
                <td><Badge variant={s.status === 'ACTIVE' ? 'success' : 'default'}>{s.status}</Badge></td>
                <td>{s.remainingSessions}</td>
                <td>{formatDate(s.endDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardShell>
  );
}
