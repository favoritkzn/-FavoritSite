'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import Link from 'next/link';
import { Button, EmptyState, Input } from '@favorit/ui';
import { apiPost } from '@/lib/api';
import { getAccessToken } from '@/lib/api';
import { getStoredRole } from '@/lib/auth';
import { formatPrice } from '@/lib/format';
import { useCartStore } from '@/stores/cart';
import styles from '@/styles/public.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [notes, setNotes] = useState('');
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(!!getAccessToken());
  }, []);

  const mutation = useMutation({
    mutationFn: () =>
      apiPost<ApiResponse<{ order: unknown; confirmationUrl?: string | null }>>('/shop/checkout', {
        notes,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          displayName: item.name,
          customization: item.customization,
        })),
      }),
    onSuccess: (res) => {
      clearCart();
      const confirmationUrl = res.data?.confirmationUrl;
      if (confirmationUrl) {
        window.location.assign(confirmationUrl);
        return;
      }
      const role = getStoredRole();
      if (role === UserRole.ADMIN) {
        router.push('/admin/shop/orders');
      } else {
        router.push('/parent/shop/orders');
      }
    },
  });

  if (authed === null) return null;

  if (!authed) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Оформление заказа</h1>
        <EmptyState
          title="Требуется авторизация"
          description="Войдите в личный кабинет для оформления заказа"
          action={
            <Link href={`/login?redirect=${encodeURIComponent('/shop/checkout')}`}>
              <Button>Войти</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <EmptyState
          title="Корзина пуста"
          action={<Link href="/shop"><Button>В магазин</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Оформление заказа</h1>
      <div className={styles.grid2}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Ваш заказ</h3>
          <div className={styles.list} style={{ marginTop: 16 }}>
            {items.map((item) => (
              <div key={item.lineId} className={styles.listItem}>
                <span>{item.name} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, marginTop: 16 }}>
            Итого: {formatPrice(totalPrice())}
          </p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Комментарий к заказу</h3>
          <Input
            label="Примечание"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Размер, пожелания..."
            style={{ marginTop: 16 }}
          />
          {mutation.isError && (
            <p style={{ color: 'var(--color-error)', fontSize: 14, marginTop: 12 }}>
              {mutation.error.message}
            </p>
          )}
          <Button
            fullWidth
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
            style={{ marginTop: 16 }}
          >
            Подтвердить заказ
          </Button>
        </div>
      </div>
    </div>
  );
}
