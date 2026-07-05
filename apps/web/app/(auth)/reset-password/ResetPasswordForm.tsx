'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { Button, Input } from '@favorit/ui';
import { ApiError, apiPost } from '@/lib/api';
import styles from '../auth.module.css';

function ResetPasswordFormInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Ссылка недействительна');
      return;
    }
    if (password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      await apiPost('/auth/reset-password', { token, newPassword: password }, { auth: false });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось сменить пароль');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <>
        <div className={styles.authHeader}>
          <h1 className={styles.title}>Ссылка недействительна</h1>
          <p className={styles.subtitle}>Запросите новую ссылку для сброса пароля</p>
        </div>
        <Link href="/forgot-password" className={styles.link} style={{ display: 'block', textAlign: 'center' }}>
          Запросить ссылку
        </Link>
      </>
    );
  }

  if (done) {
    return (
      <>
        <div className={styles.authHeader}>
          <h1 className={styles.title}>Пароль изменён</h1>
          <p className={styles.subtitle}>Теперь можно войти с новым паролем</p>
        </div>
        <Link href="/login">
          <Button fullWidth>Войти</Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <div className={styles.authHeader}>
        <h1 className={styles.title}>Новый пароль</h1>
        <p className={styles.subtitle}>Придумайте надёжный пароль (минимум 8 символов)</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <Input
          label="Новый пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          disabled={loading}
        />

        <Input
          label="Повторите пароль"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          disabled={loading}
        />

        <Button type="submit" fullWidth loading={loading}>
          Сохранить пароль
        </Button>
      </form>
    </>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: 40 }}>Загрузка...</div>}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
