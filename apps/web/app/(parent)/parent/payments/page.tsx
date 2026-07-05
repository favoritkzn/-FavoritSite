'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Payment {
  id: string;
  amount: number;
  status: string;
  description: string | null;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  SUCCEEDED: { label: 'Оплачено', variant: 'success' },
  PENDING: { label: 'Ожидает', variant: 'warning' },
  FAILED: { label: 'Ошибка', variant: 'error' },
  CANCELLED: { label: 'Отменён', variant: 'default' },
};

export default function ParentPaymentsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['payments', 'my'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Payment[]>>('/payments/my');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.PARENT} title="Оплата">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className={styles.pageTitle}>Платежи</h1>
        <Link href="/parent/payments/new"><Button>Оплатить</Button></Link>
      </div>
      {isLoading && (
        <div className={styles.skeletonList}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rect" height={60} />)}
        </div>
      )}
      {isError && <EmptyState title="Не удалось загрузить платежи" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Платежей пока нет" />}
      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((p) => {
            const st = STATUS_MAP[p.status] ?? { label: p.status, variant: 'default' as const };
            return (
              <div key={p.id} className={styles.listItem}>
                <div>
                  <div className={styles.listItemTitle}>{p.description ?? 'Платёж'}</div>
                  <div className={styles.listItemMeta}>{formatDate(p.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 600 }}>{formatPrice(p.amount)}</span>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
