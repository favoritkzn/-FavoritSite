'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@favorit/types';
import { Button, EmptyState, Skeleton } from '@favorit/ui';
import { apiGet } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { useCartStore } from '@/stores/cart';
import styles from '@/styles/public.module.css';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  slug: string;
}

export default function ShopPage() {
  const totalItems = useCartStore((s) => s.totalItems());

  const { data, isLoading, isError } = useQuery({
    queryKey: ['shop', 'products'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Product[]>>('/shop/products', { auth: false });
      return res.data ?? [];
    },
  });

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className={styles.title}>Магазин</h1>
          <p className={styles.subtitle} style={{ marginBottom: 0 }}>
            Игровая форма и атрибутика с символикой «Фаворит». Конструктор — нанесём
            фамилию и номер на футболку
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/shop/form-builder"><Button variant="secondary">Конструктор формы</Button></Link>
          <Link href="/shop/cart"><Button>Корзина ({totalItems})</Button></Link>
        </div>
      </div>

      {isLoading && (
        <div className={styles.grid} style={{ marginTop: 32 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rect" height={280} />
          ))}
        </div>
      )}

      {isError && <EmptyState title="Не удалось загрузить товары" />}

      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState title="Товаров пока нет" />
      )}

      {data && data.length > 0 && (
        <div className={styles.grid} style={{ marginTop: 32 }}>
          {data.map((product) => (
            <Link key={product.id} href={`/shop/${product.id}`} className={styles.card}>
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt=""
                  style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                />
              ) : (
                <div style={{ fontSize: 64, textAlign: 'center', marginBottom: 12 }}>👕</div>
              )}
              <h3 className={styles.cardTitle}>{product.name}</h3>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>
                {formatPrice(product.price)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
