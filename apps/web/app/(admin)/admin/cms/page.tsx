'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, Input } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet, apiPatch, ApiError } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

export default function AdminCmsPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [heroBadge, setHeroBadge] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutSubtitle, setAboutSubtitle] = useState('');

  const { data: home } = useQuery({
    queryKey: ['cms', 'home'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<{ value: Record<string, string> }>>('/cms/settings/home', { auth: false });
      return res.data?.value;
    },
  });

  const { data: about } = useQuery({
    queryKey: ['cms', 'about'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<{ value: Record<string, string> }>>('/cms/settings/about', { auth: false });
      return res.data?.value;
    },
  });

  useEffect(() => {
    if (home) {
      setHeroBadge(home.heroBadge ?? '');
      setHeroTitle(home.heroTitle ?? '');
      setHeroSubtitle(home.heroSubtitle ?? '');
    }
  }, [home]);

  useEffect(() => {
    if (about) {
      setAboutTitle(about.title ?? '');
      setAboutSubtitle(about.subtitle ?? '');
    }
  }, [about]);

  const homeMutation = useMutation({
    mutationFn: () => apiPatch('/cms/settings/home', { ...home, heroBadge, heroTitle, heroSubtitle }),
    onSuccess: () => { setSuccess('Главная сохранена'); setError(''); },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Ошибка'),
  });

  const aboutMutation = useMutation({
    mutationFn: () => apiPatch('/cms/settings/about', { ...about, title: aboutTitle, subtitle: aboutSubtitle }),
    onSuccess: () => { setSuccess('О «школе» сохранено'); setError(''); },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Ошибка'),
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Контент сайта">
      <h1 className={styles.pageTitle}>Контент сайта</h1>
      {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}
      {success && <p style={{ color: 'var(--color-success)', fontSize: 14 }}>{success}</p>}

      <Card title="Главная страница">
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); homeMutation.mutate(); }} className={styles.form} style={{ marginTop: 16, maxWidth: 560 }}>
          <Input label="Бейдж" value={heroBadge} onChange={(e) => setHeroBadge(e.target.value)} />
          <Input label="Заголовок (вторая строка после \\n)" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} hint="Используйте \n для переноса" />
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>Подзаголовок</label>
            <textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} rows={3} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
          </div>
          <Button type="submit" loading={homeMutation.isPending}>Сохранить главную</Button>
        </form>
      </Card>

      <Card title="О школе" style={{ marginTop: 24 }}>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); aboutMutation.mutate(); }} className={styles.form} style={{ marginTop: 16, maxWidth: 560 }}>
          <Input label="Заголовок" value={aboutTitle} onChange={(e) => setAboutTitle(e.target.value)} />
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>Описание</label>
            <textarea value={aboutSubtitle} onChange={(e) => setAboutSubtitle(e.target.value)} rows={4} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
          </div>
          <Button type="submit" loading={aboutMutation.isPending}>Сохранить «О школе»</Button>
        </form>
      </Card>
    </DashboardShell>
  );
}
