'use client';

import { use } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, Card, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet, apiPatch } from '@/lib/api';
import { formatDate, formatPrice, fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string | null;
  displayName: string | null;
  product: { name: string };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  items: OrderItem[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Новый',
  CONFIRMED: 'Подтверждён',
  PROCESSING: 'В обработке',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
};

const NEXT_STATUS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['shop', 'orders', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Order>>(`/shop/orders/${id}`);
      return res.data!;
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => apiPatch(`/shop/orders/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shop', 'orders', id] }),
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Заказ">
      <Link href="/admin/shop/orders" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К заказам</Link>
      {isLoading && <Skeleton variant="rect" height={300} />}
      {isError && <EmptyState title="Заказ не найден" />}
      {order && (
        <>
          <h1 className={styles.pageTitle}>Заказ #{order.id.slice(0, 8)}</h1>
          <Badge variant="default">{STATUS_LABELS[order.status] ?? order.status}</Badge>
          <p className={styles.listItemMeta} style={{ marginTop: 12 }}>
            {fullName(order.user.firstName, order.user.lastName)} · {order.user.email} · {formatDate(order.createdAt)}
          </p>
          {order.notes && <p className={styles.listItemMeta}>Примечание: {order.notes}</p>}

          <Card title="Состав заказа" style={{ marginTop: 24 }}>
            <div className={styles.list} style={{ marginTop: 12 }}>
              {order.items.map((item) => (
                <div key={item.id} className={styles.listItem}>
                  <span>{item.displayName ?? item.product.name} × {item.quantity}{item.size ? ` (${item.size})` : ''}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <p style={{ fontWeight: 700, marginTop: 16 }}>Итого: {formatPrice(order.totalAmount)}</p>
          </Card>

          {NEXT_STATUS[order.status]?.length > 0 && (
            <Card title="Статус" style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {NEXT_STATUS[order.status].map((status) => (
                  <Button
                    key={status}
                    variant="secondary"
                    loading={statusMutation.isPending}
                    onClick={() => statusMutation.mutate(status)}
                  >
                    → {STATUS_LABELS[status]}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </DashboardShell>
  );
}
