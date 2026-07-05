'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@favorit/types';
import { Button, Input } from '@favorit/ui';
import { RedCircles } from '@/components/brand/RedCircles';
import { ClientJourneyGuide } from '@/components/public/ClientJourneyGuide';
import { JoinPathCards } from '@/components/public/JoinPathCards';
import { TrialSuccessPanel, type TrialSubmission } from '@/components/public/TrialSuccessPanel';
import { apiGet, apiPost } from '@/lib/api';
import styles from '@/styles/public.module.css';

interface AcademySettings {
  name?: string;
  city?: string;
  phone?: string;
  email?: string;
  address?: string;
  social?: { vk?: string; telegram?: string };
}

interface TrialResponse {
  id: string;
  childName: string;
  parentName: string;
  phone: string;
}

export default function ContactsPage() {
  const successRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    childName: '',
    parentName: '',
    phone: '',
    email: '',
    birthDate: '',
    notes: '',
  });
  const [submission, setSubmission] = useState<TrialSubmission | null>(null);

  useEffect(() => {
    if (window.location.hash === '#trial-form' && !submission) {
      document.getElementById('trial-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [submission]);

  const { data: academy } = useQuery({
    queryKey: ['cms', 'academy'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<{ value: AcademySettings }>>('/cms/settings/academy', { auth: false });
      return res.data?.value;
    },
  });

  const mutation = useMutation({
    mutationFn: () => apiPost<ApiResponse<TrialResponse>>('/trial', form, { auth: false }),
    onSuccess: (res) => {
      const data = res.data!;
      setSubmission({
        id: data.id,
        childName: data.childName,
        parentName: data.parentName,
        phone: data.phone,
      });
      setForm({ childName: '', parentName: '', phone: '', email: '', birthDate: '', notes: '' });
      window.history.replaceState(null, '', '/contacts#trial-success');
      requestAnimationFrame(() => {
        successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  function handleNewRequest() {
    setSubmission(null);
    window.history.replaceState(null, '', '/contacts#trial-form');
    requestAnimationFrame(() => {
      document.getElementById('trial-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <div className={styles.pageWrap}>
      <RedCircles variant="page" />
      <div className={styles.container}>
        <h1 className={styles.title}>Как начать заниматься</h1>
        <p className={styles.subtitle}>
          Два разных действия: <strong>пробное занятие</strong> (простая заявка, мы перезваниваем) и{' '}
          <strong>личный кабинет</strong> (аккаунт с паролем — только когда ребёнок уже записан в академию).
        </p>

        <ClientJourneyGuide
          activeStep={submission ? 2 : 1}
          completedThrough={submission ? 1 : undefined}
        />

        {submission && (
          <div ref={successRef}>
            <TrialSuccessPanel
              submission={submission}
              academyPhone={academy?.phone}
              onNewRequest={handleNewRequest}
            />
          </div>
        )}

        <JoinPathCards />

        <div className={styles.grid2} style={{ alignItems: 'start' }}>
          <div className={styles.prose}>
            <h2>Контакты академии</h2>
            <p><strong>Адрес:</strong> {academy?.address ?? `г. ${academy?.city ?? 'Казань'}`}</p>
            <p><strong>Телефон:</strong> {academy?.phone ?? '+7 (843) 200-00-01'}</p>
            <p><strong>Email:</strong> {academy?.email ?? 'info@favorit-kzn.ru'}</p>
            {academy?.social?.telegram && (
              <p><strong>Telegram:</strong>{' '}
                <a href={academy.social.telegram} target="_blank" rel="noopener noreferrer">
                  {academy.social.telegram}
                </a>
              </p>
            )}
            <p><strong>Режим работы офиса:</strong> пн–сб, 9:00–20:00</p>
            <p style={{ marginTop: 20 }}>
              На пробное занятие возьмите спортивную форму, сменную обувь и хорошее настроение.
              Мяч и конусы мы предоставим.
            </p>
          </div>

          <div className={styles.card} id="trial-form">
            <h3 className={styles.cardTitle}>Заявка на пробное занятие</h3>
            <p className={styles.cardMeta} style={{ marginBottom: 16 }}>
              Заполните форму и нажмите кнопку внизу — заявка сразу попадёт к администратору.
              Пароль и email для входа здесь не нужны.
            </p>
            {submission ? (
              <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                Ваша заявка уже отправлена — смотрите подтверждение{' '}
                <a href="#trial-success" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                  выше на странице
                </a>
                . Чтобы отправить ещё одну, нажмите «Отправить ещё одну заявку» в зелёном блоке.
              </p>
            ) : (
              <form
                className={styles.form}
                style={{ maxWidth: 'none', marginTop: 0 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  mutation.mutate();
                }}
              >
                <Input
                  label="Имя ребёнка"
                  value={form.childName}
                  onChange={(e) => update('childName', e.target.value)}
                  required
                />
                <Input
                  label="Ваше имя"
                  value={form.parentName}
                  onChange={(e) => update('parentName', e.target.value)}
                  required
                />
                <Input
                  label="Телефон"
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  hint="Необязательно — для связи по почте"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
                <Input
                  label="Дата рождения ребёнка"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => update('birthDate', e.target.value)}
                />
                <Input
                  label="Комментарий"
                  placeholder="Удобное время, опыт занятий..."
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                />
                {mutation.isError && (
                  <p style={{ color: 'var(--color-primary)', fontSize: 14 }}>
                    {mutation.error.message}
                  </p>
                )}
                <Button type="submit" loading={mutation.isPending} fullWidth>
                  Отправить заявку на пробное
                </Button>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
                  После отправки на этой странице появится подтверждение с номером заявки
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
