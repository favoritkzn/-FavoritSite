'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, Input } from '@favorit/ui';
import { FileUpload } from '@/components/admin/FileUpload';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet, apiPost, ApiError } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

interface Category {
  id: string;
  name: string;
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [imageUrl, setImageUrl] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['shop', 'categories'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Category[]>>('/shop/categories', { auth: false });
      return res.data ?? [];
    },
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiPost('/shop/products', {
        categoryId,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description: description || undefined,
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl || undefined,
      }),
    onSuccess: () => router.push('/admin/shop/products'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    mutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Не удалось создать'),
    });
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Новый товар">
      <Link href="/admin/shop/products" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К товарам</Link>
      <h1 className={styles.pageTitle}>Новый товар</h1>

      <Card title="Параметры">
        <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 520 }}>
          {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}

          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>Категория</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
            >
              <option value="">Выберите категорию</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Input label="Цена (₽)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min={0} />
          <Input label="Остаток" type="number" value={stock} onChange={(e) => setStock(e.target.value)} min={0} />
          <FileUpload label="Фото товара" value={imageUrl} onChange={setImageUrl} disabled={mutation.isPending} />
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
            />
          </div>

          <Button type="submit" loading={mutation.isPending}>Создать</Button>
        </form>
      </Card>
    </DashboardShell>
  );
}
