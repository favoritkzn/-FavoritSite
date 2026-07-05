'use client';

import { use, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, EmptyState, Input, Skeleton } from '@favorit/ui';
import { FileUpload } from '@/components/admin/FileUpload';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet, apiPatch, ApiError } from '@/lib/api';
import { fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Coach {
  id: string;
  bio: string | null;
  experience: string | null;
  photo: string | null;
  isPublic: boolean;
  user: { firstName: string; lastName: string; email: string };
}

export default function AdminCoachEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [error, setError] = useState('');

  const { data: coach, isLoading, isError } = useQuery({
    queryKey: ['coaches', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Coach>>(`/coaches/${id}`);
      return res.data!;
    },
  });

  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [photo, setPhoto] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (coach) {
      setBio(coach.bio ?? '');
      setExperience(coach.experience ?? '');
      setPhoto(coach.photo ?? '');
      setIsPublic(coach.isPublic);
    }
  }, [coach]);

  const mutation = useMutation({
    mutationFn: () => apiPatch(`/coaches/${id}`, { bio: bio || undefined, experience: experience || undefined, photo: photo || undefined, isPublic }),
    onSuccess: () => router.push('/admin/coaches'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    mutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Ошибка сохранения'),
    });
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Редактирование тренера">
      <Link href="/admin/coaches" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К списку</Link>
      {isLoading && <Skeleton variant="rect" height={300} />}
      {isError && <EmptyState title="Тренер не найден" />}
      {coach && (
        <>
          <h1 className={styles.pageTitle}>{fullName(coach.user.firstName, coach.user.lastName)}</h1>
          <p className={styles.listItemMeta}>{coach.user.email}</p>
          <Card title="Профиль на сайте">
            <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 520 }}>
              {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}
              <FileUpload label="Фото" value={photo} onChange={setPhoto} disabled={mutation.isPending} />
              <Input label="Опыт" value={experience} onChange={(e) => setExperience(e.target.value)} />
              <div>
                <label style={{ fontSize: 14, fontWeight: 500 }}>Биография</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                Показывать на сайте
              </label>
              <Button type="submit" loading={mutation.isPending}>Сохранить</Button>
            </form>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
