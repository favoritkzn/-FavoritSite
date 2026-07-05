'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  category: { name: string };
}

export default function AdminShopProductsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['shop', 'products', 'admin'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Product[]>>('/shop/admin/products');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Товары">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Товары магазина</h1>
        <Link href="/admin/shop/products/new"><Button>Добавить</Button></Link>
      </div>
      {isLoading && <div className={styles.grid}>{[1, 2].map((i) => <Skeleton key={i} variant="rect" height={80} />)}</div>}
      {isError && <EmptyState title="Не удалось загрузить" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Нет товаров" />}
      {data && data.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Остаток</th>
              <th>Активен</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/shop/products/${p.id}/edit`} style={{ color: 'var(--color-primary)' }}>
                    {p.name}
                  </Link>
                </td>
                <td>{p.category?.name ?? '—'}</td>
                <td>{formatPrice(p.price)}</td>
                <td>{p.stock}</td>
                <td>{p.isActive ? 'Да' : 'Нет'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardShell>
  );
}
