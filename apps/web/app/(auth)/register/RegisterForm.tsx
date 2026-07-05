'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button, Input } from '@favorit/ui';
import { register } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import authStyles from '../auth.module.css';
import styles from './register.module.css';

export function RegisterForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childBirthDate, setChildBirthDate] = useState('');
  const [childGender, setChildGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (password.length < 6) {
      errors.password = 'Пароль минимум 6 символов';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }
    if (!agreed) {
      errors.agreed = 'Необходимо согласие с политикой';
    }
    if (!childBirthDate) {
      errors.childBirthDate = 'Укажите дату рождения ребёнка';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);

    try {
      await register({
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        password,
        childFirstName,
        childLastName,
        childBirthDate,
        childGender,
      });
      window.location.assign('/register/pending');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Не удалось создать аккаунт. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className={authStyles.authHeader}>
        <h1 className={authStyles.title}>Личный кабинет родителя</h1>
        <p className={authStyles.subtitle}>
          Создайте аккаунт для расписания, посещаемости и оплаты. Ребёнок должен быть уже записан в академию.
        </p>
      </div>

      <form className={authStyles.form} onSubmit={handleSubmit}>
        <div className={styles.infoBox}>
          <strong>Это не запись на пробное занятие.</strong> Если ребёнок ещё не занимался у нас — сначала{' '}
          <Link href="/contacts#trial-form">оставьте заявку на пробное</Link>. Кабинет создавайте,
          когда администратор уже записал ребёнка в группу.
        </div>

        {error && <div className={authStyles.error}>{error}</div>}

        <p className={styles.sectionLabel}>Родитель</p>
        <div className={styles.registerRow}>
          <Input
            label="Имя"
            name="firstName"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            label="Фамилия"
            name="lastName"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <Input
          label="Телефон"
          type="tel"
          name="phone"
          autoComplete="tel"
          hint="Для связи с администратором"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={loading}
        />

        <Input
          label="Пароль"
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          required
          disabled={loading}
        />

        <Input
          label="Повторите пароль"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
          required
          disabled={loading}
        />

        <p className={styles.sectionLabel} style={{ marginTop: 8 }}>Ребёнок</p>
        <div className={styles.registerRow}>
          <Input
            label="Имя"
            value={childFirstName}
            onChange={(e) => setChildFirstName(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            label="Фамилия"
            value={childLastName}
            onChange={(e) => setChildLastName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <Input
          label="Дата рождения"
          type="date"
          value={childBirthDate}
          onChange={(e) => setChildBirthDate(e.target.value)}
          error={fieldErrors.childBirthDate}
          required
          disabled={loading}
        />

        <div>
          <label style={{ fontSize: 14, fontWeight: 500 }}>Пол</label>
          <select
            value={childGender}
            onChange={(e) => setChildGender(e.target.value as 'MALE' | 'FEMALE')}
            disabled={loading}
            style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
          >
            <option value="MALE">Мужской</option>
            <option value="FEMALE">Женский</option>
          </select>
        </div>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={loading}
          />
          <span>
            Согласен с{' '}
            <Link href="/privacy" target="_blank">
              политикой конфиденциальности
            </Link>
          </span>
        </label>
        {fieldErrors.agreed && (
          <span style={{ fontSize: 13, color: 'var(--color-error)', marginTop: -8 }}>
            {fieldErrors.agreed}
          </span>
        )}

        <Button type="submit" fullWidth loading={loading} disabled={!agreed}>
          Создать аккаунт
        </Button>

        <div className={authStyles.links}>
          <span className={authStyles.muted}>Уже есть аккаунт?</span>
          <Link href="/login" className={authStyles.link}>
            Войти
          </Link>
        </div>

        <p className={styles.trialLink}>
          Впервые у нас? <Link href="/contacts#trial-form">Записаться на пробное занятие</Link>
        </p>
      </form>
    </>
  );
}
