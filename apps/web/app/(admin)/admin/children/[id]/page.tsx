'use client';

import { use, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Avatar, Button, Card, EmptyState, Input, Skeleton } from '@favorit/ui';
import { FileUpload } from '@/components/admin/FileUpload';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet, apiPatch, ApiError } from '@/lib/api';
import { calcAge, formatShortDate, fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  photo: string | null;
  medicalInfo: string | null;
  jerseyNumber: number | null;
  isActive: boolean;
  groups: Array<{ group: { id: string; name: string } }>;
}

export default function AdminChildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  const { data: child, isLoading, isError, refetch } = useQuery({
    queryKey: ['children', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Child>>(`/children/${id}`);
      return res.data!;
    },
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [medicalInfo, setMedicalInfo] = useState('');
  const [photo, setPhoto] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (child) {
      setFirstName(child.firstName);
      setLastName(child.lastName);
      setBirthDate(child.birthDate.slice(0, 10));
      setGender(child.gender as 'MALE' | 'FEMALE');
      setMedicalInfo(child.medicalInfo ?? '');
      setPhoto(child.photo ?? '');
      setJerseyNumber(child.jerseyNumber != null ? String(child.jerseyNumber) : '');
      setIsActive(child.isActive);
    }
  }, [child]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiPatch(`/children/${id}`, {
        firstName,
        lastName,
        birthDate,
        gender,
        medicalInfo: medicalInfo || undefined,
        photo: photo || undefined,
        jerseyNumber: jerseyNumber.trim() ? parseInt(jerseyNumber, 10) : null,
        isActive,
      }),
    onSuccess: () => {
      setEditing(false);
      refetch();
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    saveMutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Ошибка сохранения'),
    });
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Ученик">
      <Link href="/admin/children" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К списку</Link>
      {isLoading && <Skeleton variant="rect" height={200} />}
      {isError && <EmptyState title="Не найден" />}
      {child && (
        <>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24, marginTop: 16 }}>
            <Avatar src={child.photo} name={fullName(child.firstName, child.lastName)} size="lg" />
            <div>
              <h1 className={styles.pageTitle}>{fullName(child.firstName, child.lastName)}</h1>
              <p className={styles.listItemMeta}>{calcAge(child.birthDate)} лет · {formatShortDate(child.birthDate)}</p>
            </div>
          </div>

          {!editing ? (
            <>
              <div className={styles.grid}>
                <Card title="Группа">
                  {child.groups[0] ? (
                    <Link href={`/admin/groups/${child.groups[0].group.id}`} style={{ color: 'var(--color-primary)' }}>
                      {child.groups[0].group.name}
                    </Link>
                  ) : (
                    <p>Не назначена</p>
                  )}
                </Card>
                <Card title="Статус"><p>{child.isActive ? 'Активен' : 'Неактивен'}</p></Card>
                <Card title="Номер формы"><p>{child.jerseyNumber ?? '—'}</p></Card>
                <Card title="Мед. информация"><p>{child.medicalInfo ?? '—'}</p></Card>
              </div>
              <Button style={{ marginTop: 24 }} onClick={() => setEditing(true)}>Редактировать</Button>
            </>
          ) : (
            <Card title="Редактирование">
              <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 480 }}>
                {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}
                <div className={styles.formRow}>
                  <Input label="Имя" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  <Input label="Фамилия" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
                <Input label="Дата рождения" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
                <div>
                  <label style={{ fontSize: 14, fontWeight: 500 }}>Пол</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                    <option value="MALE">Мужской</option>
                    <option value="FEMALE">Женский</option>
                  </select>
                </div>
                <Input label="Мед. информация" value={medicalInfo} onChange={(e) => setMedicalInfo(e.target.value)} />
                <Input
                  label="Номер формы (1–99)"
                  inputMode="numeric"
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="Не назначен"
                />
                <FileUpload label="Фото" value={photo} onChange={setPhoto} disabled={saveMutation.isPending} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  Активен
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button type="submit" loading={saveMutation.isPending}>Сохранить</Button>
                  <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Отмена</Button>
                </div>
              </form>
            </Card>
          )}
        </>
      )}
    </DashboardShell>
  );
}
