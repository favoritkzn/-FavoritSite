'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button, Input } from '@favorit/ui';
import { login, resolvePostLoginPath } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import styles from '../auth.module.css';

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ email, password });
      const path = resolvePostLoginPath(redirect, user.role);
      window.location.assign(path);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Не удалось войти. Проверьте подключение к интернету.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className={styles.authHeader}>
        <h1 className={styles.title}>Вход в личный кабинет</h1>
        <p className={styles.subtitle}>Для родителей, тренеров и администрации академии</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <Input
          label="Пароль"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <Button type="submit" fullWidth loading={loading}>
          Войти
        </Button>

        <div className={styles.forgot}>
          <Link href="/forgot-password" className={styles.link}>
            Забыли пароль?
          </Link>
        </div>

        <div className={styles.links}>
          <span className={styles.muted}>Нет аккаунта?</span>
          <Link href="/register" className={styles.link}>
            Создать личный кабинет
          </Link>
        </div>

        <p className={styles.muted} style={{ textAlign: 'center', fontSize: 13, lineHeight: 1.5 }}>
          Впервые у нас?{' '}
          <Link href="/contacts" className={styles.link}>
            Записаться на пробное занятие
          </Link>
        </p>
      </form>
    </>
  );
}
