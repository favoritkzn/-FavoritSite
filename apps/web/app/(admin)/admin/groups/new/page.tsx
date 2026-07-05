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

export default function AdminNewGroupPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [description, setDescription] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      apiPost('/groups', {
        name,
        ageCategory,
        description: description || undefined,
        maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
      }),
    onSuccess: () => router.push('/admin/groups'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    mutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Не удалось создать'),
    });
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Новая группа">
      <Link href="/admin/groups" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К списку</Link>
      <h1 className={styles.pageTitle}>Новая группа</h1>

      <Card title="Параметры">
        <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 480 }}>
          {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}
          <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Возрастная категория" value={ageCategory} onChange={(e) => setAgeCategory(e.target.value)} placeholder="U10, U12..." required />
          <Input label="Макс. учеников" type="number" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} min={1} />
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
