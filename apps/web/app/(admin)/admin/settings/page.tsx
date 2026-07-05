'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, Input } from '@favorit/ui';
import { DevInfraCard } from '@/components/admin/DevInfraCard';
import { DashboardShell } from '@/components/DashboardShell';
import { useAuthUser } from '@/hooks/useAuthUser';
import { logout } from '@/lib/auth';
import { apiGet, apiPatch, apiPost, ApiError } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

interface AcademySettings {
  name: string;
  city: string;
  phone: string;
  email: string;
  address: string;
  social: { vk?: string; telegram?: string };
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { data: user } = useAuthUser();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cmsError, setCmsError] = useState('');
  const [cmsSuccess, setCmsSuccess] = useState('');

  const [academyName, setAcademyName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [vk, setVk] = useState('');
  const [telegram, setTelegram] = useState('');

  const { data: cms } = useQuery({
    queryKey: ['cms', 'academy'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<{ value: AcademySettings }>>('/cms/settings/academy', { auth: false });
      return res.data?.value;
    },
  });

  useEffect(() => {
    if (cms) {
      setAcademyName(cms.name ?? '');
      setCity(cms.city ?? '');
      setPhone(cms.phone ?? '');
      setEmail(cms.email ?? '');
      setAddress(cms.address ?? '');
      setVk(cms.social?.vk ?? '');
      setTelegram(cms.social?.telegram ?? '');
    }
  }, [cms]);

  const passwordMutation = useMutation({
    mutationFn: () =>
      apiPost('/auth/change-password', { currentPassword, newPassword }),
    onSuccess: () => {
      setSuccess('Пароль успешно изменён');
      setError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err) => {
      setSuccess('');
      setError(err instanceof ApiError ? err.message : 'Не удалось сменить пароль');
    },
  });

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    passwordMutation.mutate();
  }

  const cmsMutation = useMutation({
    mutationFn: () =>
      apiPatch('/cms/settings/academy', {
        name: academyName,
        city,
        phone,
        email,
        address,
        social: { vk: vk || undefined, telegram: telegram || undefined },
      }),
    onSuccess: () => {
      setCmsSuccess('Контакты сохранены');
      setCmsError('');
    },
    onError: (err) => {
      setCmsSuccess('');
      setCmsError(err instanceof ApiError ? err.message : 'Не удалось сохранить');
    },
  });

  function handleCmsSubmit(e: FormEvent) {
    e.preventDefault();
    setCmsError('');
    setCmsSuccess('');
    cmsMutation.mutate();
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Настройки">
      <h1 className={styles.pageTitle}>Настройки</h1>

      <Card title="Профиль администратора">
        <div className={styles.form} style={{ marginTop: 16, maxWidth: 480 }}>
          <Input label="Имя" value={user?.firstName ?? ''} readOnly />
          <Input label="Фамилия" value={user?.lastName ?? ''} readOnly />
          <Input label="Email" value={user?.email ?? ''} readOnly />
        </div>
      </Card>

      <Card title="Смена пароля" style={{ marginTop: 24 }}>
        <form className={styles.form} onSubmit={handlePasswordSubmit} style={{ marginTop: 16, maxWidth: 480 }}>
          {error && (
            <p style={{ color: 'var(--color-error)', fontSize: 14, margin: 0 }}>{error}</p>
          )}
          {success && (
            <p style={{ color: 'var(--color-success)', fontSize: 14, margin: 0 }}>{success}</p>
          )}
          <Input
            label="Текущий пароль"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={passwordMutation.isPending}
          />
          <Input
            label="Новый пароль"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            disabled={passwordMutation.isPending}
          />
          <Input
            label="Повторите новый пароль"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            disabled={passwordMutation.isPending}
          />
          <Button type="submit" loading={passwordMutation.isPending}>
            Сохранить пароль
          </Button>
        </form>
      </Card>

      <Card title="Контакты академии (CMS)" style={{ marginTop: 24 }}>
        <form className={styles.form} onSubmit={handleCmsSubmit} style={{ marginTop: 16, maxWidth: 480 }}>
          {cmsError && <p style={{ color: 'var(--color-error)', fontSize: 14, margin: 0 }}>{cmsError}</p>}
          {cmsSuccess && <p style={{ color: 'var(--color-success)', fontSize: 14, margin: 0 }}>{cmsSuccess}</p>}
          <Input label="Название" value={academyName} onChange={(e) => setAcademyName(e.target.value)} required disabled={cmsMutation.isPending} />
          <Input label="Город" value={city} onChange={(e) => setCity(e.target.value)} disabled={cmsMutation.isPending} />
          <Input label="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={cmsMutation.isPending} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={cmsMutation.isPending} />
          <Input label="Адрес" value={address} onChange={(e) => setAddress(e.target.value)} disabled={cmsMutation.isPending} />
          <Input label="VK" value={vk} onChange={(e) => setVk(e.target.value)} placeholder="https://vk.com/..." disabled={cmsMutation.isPending} />
          <Input label="Telegram" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="https://t.me/..." disabled={cmsMutation.isPending} />
          <Button type="submit" loading={cmsMutation.isPending}>Сохранить контакты</Button>
        </form>
      </Card>

      <DevInfraCard />

      <Button
        variant="secondary"
        style={{ marginTop: 24 }}
        onClick={async () => {
          await logout();
          router.push('/login');
        }}
      >
        Выйти
      </Button>
    </DashboardShell>
  );
}
