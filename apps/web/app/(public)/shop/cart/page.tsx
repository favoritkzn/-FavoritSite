'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, EmptyState } from '@favorit/ui';
import { useCartStore } from '@/stores/cart';
import { formatPrice } from '@/lib/format';
import styles from '@/styles/public.module.css';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Корзина</h1>
        <EmptyState
          title="Корзина пуста"
          description="Добавьте товары из магазина"
          action={<Link href="/shop"><Button>В магазин</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Корзина</h1>
      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.lineId} className={styles.listItem}>
            <div>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
              {item.size && <div className={styles.cardMeta}>Размер: {item.size}</div>}
              {item.customization && (
                <div className={styles.cardMeta}>
                  {item.customization.surname} #{item.customization.number}
                </div>
              )}
              <div style={{ fontWeight: 600, color: 'var(--color-primary)', marginTop: 4 }}>
                {formatPrice(item.price)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                style={{ width: 32, height: 32, border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer' }}
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                style={{ width: 32, height: 32, border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer' }}
              >
                +
              </button>
              <Button variant="ghost" size="sm" onClick={() => removeItem(item.lineId)}>
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>
          Итого: {formatPrice(totalPrice())}
        </div>
        <Link href="/shop/checkout"><Button size="lg">Оформить заказ</Button></Link>
      </div>
    </div>
  );
}
