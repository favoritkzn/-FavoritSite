'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import { Button, Card, Input } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiPost, ApiError } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

export default function AdminNewAlbumPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const mutation = useMutation({
    mutationFn: () =>
      apiPost('/media/albums', {
        title,
        description: description || undefined,
        coverUrl: coverUrl || undefined,
        isPublic,
      }),
    onSuccess: () => router.push('/admin/media'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    mutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Не удалось создать'),
    });
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Новый альбом">
      <Link href="/admin/media" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К медиа</Link>
      <h1 className={styles.pageTitle}>Новый альбом</h1>
      <Card title="Параметры">
        <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 480 }}>
          {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}
          <Input label="Название" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Обложка (URL)" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>Описание</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Публичный (виден в галерее)
          </label>
          <Button type="submit" loading={mutation.isPending}>Создать</Button>
        </form>
      </Card>
    </DashboardShell>
  );
}
