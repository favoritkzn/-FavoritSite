'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import { Button, Card, Input } from '@favorit/ui';
import { FileUpload } from '@/components/admin/FileUpload';
import { DashboardShell } from '@/components/DashboardShell';
import { apiPost, ApiError } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

export default function AdminNewChildPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [medicalInfo, setMedicalInfo] = useState('');
  const [photo, setPhoto] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      apiPost('/children', {
        firstName,
        lastName,
        birthDate,
        gender,
        medicalInfo: medicalInfo || undefined,
        photo: photo || undefined,
        jerseyNumber: jerseyNumber.trim() ? parseInt(jerseyNumber, 10) : undefined,
      }),
    onSuccess: () => router.push('/admin/children'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    mutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Не удалось создать'),
    });
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Новый ученик">
      <Link href="/admin/children" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К списку</Link>
      <h1 className={styles.pageTitle}>Новый ученик</h1>

      <Card title="Данные ученика">
        <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 480 }}>
          {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}
          <div className={styles.formRow}>
            <Input label="Имя" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Фамилия" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <Input label="Дата рождения" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>Пол</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
              style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
            >
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
          <FileUpload label="Фото" value={photo} onChange={setPhoto} disabled={mutation.isPending} />
          <Button type="submit" loading={mutation.isPending}>Создать</Button>
        </form>
      </Card>
    </DashboardShell>
  );
}
