'use client';

import { use } from 'react';
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
  stock: number;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const addItem = useCartStore((s) => s.addItem);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['shop', 'products', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Product>>(`/shop/products/${id}`, { auth: false });
      return res.data!;
    },
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Skeleton variant="rect" height={300} />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className={styles.container}>
        <EmptyState title="Товар не найден" action={<Link href="/shop"><Button>К магазину</Button></Link>} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid2}>
        <div>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt=""
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 12 }}
            />
          ) : (
            <div style={{ fontSize: 120, textAlign: 'center' }}>👕</div>
          )}
        </div>
        <div>
          <h1 className={styles.title}>{product.name}</h1>
          <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 16 }}>
            {formatPrice(product.price)}
          </p>
          {product.description && <p className={styles.cardMeta}>{product.description}</p>}
          <p className={styles.cardMeta}>В наличии: {product.stock} шт.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Button
              onClick={() =>
                addItem({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl ?? undefined,
                })
              }
            >
              В корзину
            </Button>
            <Link href="/shop/cart"><Button variant="secondary">Корзина</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
