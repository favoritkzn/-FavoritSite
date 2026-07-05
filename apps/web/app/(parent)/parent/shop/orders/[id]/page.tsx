'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, Card, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  items: Array<{
    quantity: number;
    unitPrice: number;
    product: { name: string };
  }>;
}

export default function ParentShopOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['shop', 'orders', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Order>>(`/shop/orders/${id}`);
      return res.data!;
    },
  });

  return (
    <DashboardShell role={UserRole.PARENT} title="Заказ">
      {isLoading && <Skeleton variant="rect" height={200} />}
      {isError && <EmptyState title="Заказ не найден" />}
      {order && (
        <>
          <h1 className={styles.pageTitle}>Заказ #{order.id.slice(0, 8)}</h1>
          <Badge variant="default" style={{ marginBottom: 16 }}>{order.status}</Badge>
          <Card title="Состав заказа">
            <div className={styles.list} style={{ marginTop: 12 }}>
              {order.items.map((item, i) => (
                <div key={i} className={styles.listItem}>
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <p style={{ fontWeight: 700, marginTop: 16 }}>Итого: {formatPrice(order.totalAmount)}</p>
          </Card>
          <p className={styles.listItemMeta} style={{ marginTop: 12 }}>
            Оформлен: {formatDate(order.createdAt)}
          </p>
          {order.notes && <p className={styles.listItemMeta}>Примечание: {order.notes}</p>}
          <Link href="/parent/shop/orders" style={{ marginTop: 24, display: 'inline-block' }}>
            <Button variant="secondary">← К заказам</Button>
          </Link>
        </>
      )}
    </DashboardShell>
  );
}
