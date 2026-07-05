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
  items: Array<{ product: { name: string }; quantity: number }>;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'В обработке',
  CONFIRMED: 'Подтверждён',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
};

export default function ParentShopOrdersPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['shop', 'orders'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Order[]>>('/shop/orders');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.PARENT} title="Заказы">
      <h1 className={styles.pageTitle}>Заказы магазина</h1>
      {isLoading && (
        <div className={styles.skeletonList}>
          {[1, 2].map((i) => <Skeleton key={i} variant="rect" height={72} />)}
        </div>
      )}
      {isError && <EmptyState title="Не удалось загрузить заказы" />}
      {!isLoading && data?.length === 0 && (
        <EmptyState title="Заказов пока нет" description="Посетите магазин" />
      )}
      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((order) => (
            <Link key={order.id} href={`/parent/shop/orders/${order.id}`} className={styles.listItem}>
              <div>
                <div className={styles.listItemTitle}>Заказ #{order.id.slice(0, 8)}</div>
                <div className={styles.listItemMeta}>{formatDate(order.createdAt)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 600 }}>{formatPrice(order.totalAmount)}</span>
                <Badge variant="default">{STATUS_LABELS[order.status] ?? order.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
