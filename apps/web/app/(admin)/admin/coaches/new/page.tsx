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

interface Group {
  id: string;
  name: string;
  ageCategory: string;
}

export default function AdminNewCoachPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [photo, setPhoto] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [groupIds, setGroupIds] = useState<string[]>([]);

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Group[]>>('/groups');
      return res.data ?? [];
    },
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiPost('/coaches/with-user', {
        email,
        password,
        firstName,
        lastName,
        phone: phone || undefined,
        bio: bio || undefined,
        experience: experience || undefined,
        photo: photo || undefined,
        isPublic,
        groupIds: groupIds.length ? groupIds : undefined,
      }),
    onSuccess: () => router.push('/admin/coaches'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    mutation.mutate(undefined, {
      onError: (err) => {
        setError(err instanceof ApiError ? err.message : 'Не удалось создать тренера');
      },
    });
  }

  function toggleGroup(id: string) {
    setGroupIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Новый тренер">
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/coaches" style={{ color: 'var(--color-primary)', fontSize: 14 }}>
          ← К списку тренеров
        </Link>
      </div>

      <h1 className={styles.pageTitle}>Добавить тренера</h1>

      <Card title="Аккаунт">
        <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 520 }}>
          {error && (
            <p style={{ color: 'var(--color-error)', fontSize: 14, margin: 0 }}>{error}</p>
          )}

          <div className={styles.formRow}>
            <Input
              label="Имя"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={mutation.isPending}
            />
            <Input
              label="Фамилия"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={mutation.isPending}
            />
          </div>

          <Input
            label="Email (логин)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={mutation.isPending}
          />

          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            hint="Минимум 6 символов. Передайте пароль тренеру лично."
            disabled={mutation.isPending}
          />

          <Input
            label="Телефон"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={mutation.isPending}
          />

          <FileUpload
            label="Фото"
            value={photo}
            onChange={setPhoto}
            disabled={mutation.isPending}
            hint="Загрузите с компьютера или сделайте фото на телефоне"
          />

          <Input
            label="Опыт"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Например: 8 лет"
            disabled={mutation.isPending}
          />

          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>О тренере</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              disabled={mutation.isPending}
              style={{
                width: '100%',
                marginTop: 6,
                padding: 10,
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                resize: 'vertical',
              }}
              placeholder="Краткая биография для сайта"
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={mutation.isPending}
            />
            Показывать на публичной странице «Тренеры»
          </label>

          {groups && groups.length > 0 && (
            <div>
              <label style={{ fontSize: 14, fontWeight: 500 }}>Группы</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {groups.map((g) => (
                  <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={groupIds.includes(g.id)}
                      onChange={() => toggleGroup(g.id)}
                      disabled={mutation.isPending}
                    />
                    {g.name} ({g.ageCategory})
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Button type="submit" loading={mutation.isPending}>
              Создать аккаунт
            </Button>
            <Link href="/admin/coaches">
              <Button type="button" variant="secondary" disabled={mutation.isPending}>
                Отмена
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
}
