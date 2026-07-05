'use client';

import { use, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, EmptyState, Input, Skeleton } from '@favorit/ui';
import { FileUpload } from '@/components/admin/FileUpload';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet, apiPatch, ApiError } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: string;
  category: { name: string };
}

interface Category {
  id: string;
  name: string;
}

export default function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [error, setError] = useState('');

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['shop', 'products', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Product>>(`/shop/products/${id}`, { auth: false });
      return res.data!;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['shop', 'categories'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Category[]>>('/shop/categories', { auth: false });
      return res.data ?? [];
    },
  });

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSlug(product.slug);
      setCategoryId(product.categoryId);
      setDescription(product.description ?? '');
      setPrice(String(product.price));
      setStock(String(product.stock));
      setImageUrl(product.imageUrl ?? '');
      setIsActive(product.isActive);
    }
  }, [product]);

  const mutation = useMutation({
    mutationFn: () =>
      apiPatch(`/shop/products/${id}`, {
        name,
        slug,
        categoryId,
        description: description || undefined,
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl || undefined,
        isActive,
      }),
    onSuccess: () => router.push('/admin/shop/products'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    mutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Ошибка сохранения'),
    });
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Товар">
      <Link href="/admin/shop/products" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К товарам</Link>
      {isLoading && <Skeleton variant="rect" height={400} />}
      {isError && <EmptyState title="Товар не найден" />}
      {product && (
        <>
          <h1 className={styles.pageTitle}>{product.name}</h1>
          <Card title="Редактирование">
            <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 520 }}>
              {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}
              <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
              <div>
                <label style={{ fontSize: 14, fontWeight: 500 }}>Категория</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <Input label="Цена" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min={0} />
              <Input label="Остаток" type="number" value={stock} onChange={(e) => setStock(e.target.value)} min={0} />
              <FileUpload label="Фото товара" value={imageUrl} onChange={setImageUrl} disabled={mutation.isPending} />
              <div>
                <label style={{ fontSize: 14, fontWeight: 500 }}>Описание</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                Активен (виден в магазине)
              </label>
              <Button type="submit" loading={mutation.isPending}>Сохранить</Button>
            </form>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
