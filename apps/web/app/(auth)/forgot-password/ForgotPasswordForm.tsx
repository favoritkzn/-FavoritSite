'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button, Input } from '@favorit/ui';
import type { ApiResponse } from '@favorit/types';
import { ApiError, apiPost } from '@/lib/api';
import styles from '../auth.module.css';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiPost<ApiResponse<{ devResetUrl?: string }>>(
        '/auth/forgot-password',
        { email },
        { auth: false },
      );
      setDevResetUrl(res.data?.devResetUrl ?? null);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось отправить запрос');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <>
        <div className={styles.authHeader}>
          <h1 className={styles.title}>Проверьте почту</h1>
          <p className={styles.subtitle}>
            Если аккаунт с адресом {email} существует, мы отправили ссылку для сброса пароля.
          </p>
        </div>
        {devResetUrl && (
          <p className={styles.muted} style={{ fontSize: 13, wordBreak: 'break-all' }}>
            Dev: <Link href={devResetUrl} className={styles.link}>{devResetUrl}</Link>
          </p>
        )}
        <Link href="/login" className={styles.link} style={{ display: 'block', textAlign: 'center', marginTop: 24 }}>
          Вернуться ко входу
        </Link>
      </>
    );
  }

  return (
    <>
      <div className={styles.authHeader}>
        <h1 className={styles.title}>Забыли пароль?</h1>
        <p className={styles.subtitle}>Введите email — пришлём ссылку для сброса</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <Button type="submit" fullWidth loading={loading}>
          Отправить ссылку
        </Button>

        <div className={styles.links}>
          <Link href="/login" className={styles.link}>← Вернуться ко входу</Link>
        </div>
      </form>
    </>
  );
}
