'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

export default function AdminShopOrdersPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['shop', 'orders', 'admin'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Order[]>>('/shop/orders');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Заказы">
      <h1 className={styles.pageTitle}>Заказы магазина</h1>
      {isLoading && <div className={styles.skeletonList}>{[1, 2].map((i) => <Skeleton key={i} variant="rect" height={60} />)}</div>}
      {isError && <EmptyState title="Не удалось загрузить" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Нет заказов" />}
      {data && data.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Дата</th>
              <th>Сумма</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {data.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link href={`/admin/shop/orders/${o.id}`} style={{ color: 'var(--color-primary)' }}>
                    {o.id.slice(0, 8)}
                  </Link>
                </td>
                <td>{o.user.firstName} {o.user.lastName}</td>
                <td>{formatDate(o.createdAt)}</td>
                <td>{formatPrice(o.totalAmount)}</td>
                <td><Badge variant="default">{o.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardShell>
  );
}
