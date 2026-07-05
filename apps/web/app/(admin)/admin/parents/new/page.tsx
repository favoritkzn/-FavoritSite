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

export default function AdminNewParentPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      apiPost('/parents/with-user', { email, password, firstName, lastName, phone: phone || undefined, address: address || undefined }),
    onSuccess: () => router.push('/admin/parents'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    mutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Не удалось создать'),
    });
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Новый родитель">
      <Link href="/admin/parents" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К списку</Link>
      <h1 className={styles.pageTitle}>Создать аккаунт родителя</h1>
      <Card title="Данные">
        <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 480 }}>
          {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}
          <div className={styles.formRow}>
            <Input label="Имя" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Фамилия" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <Input label="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Адрес" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Button type="submit" loading={mutation.isPending}>Создать</Button>
        </form>
      </Card>
    </DashboardShell>
  );
}
