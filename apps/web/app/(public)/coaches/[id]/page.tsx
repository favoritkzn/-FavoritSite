'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@favorit/types';
import { Avatar, Button, EmptyState, Skeleton } from '@favorit/ui';
import { apiGet } from '@/lib/api';
import { fullName } from '@/lib/format';
import styles from '@/styles/public.module.css';

interface Coach {
  id: string;
  bio: string | null;
  experience: string | null;
  photo: string | null;
  user: { firstName: string; lastName: string };
}

export default function CoachDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: coach, isLoading, isError } = useQuery({
    queryKey: ['coaches', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Coach>>(`/coaches/${id}`, { auth: false });
      return res.data!;
    },
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Skeleton variant="avatar" width={120} height={120} />
        <Skeleton variant="title" width="40%" />
        <Skeleton variant="text" />
      </div>
    );
  }

  if (isError || !coach) {
    return (
      <div className={styles.container}>
        <EmptyState title="Тренер не найден" action={<Link href="/coaches"><Button>К списку</Button></Link>} />
      </div>
    );
  }

  const name = fullName(coach.user.firstName, coach.user.lastName);

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Avatar src={coach.photo} name={name} size="lg" />
        <div>
          <h1 className={styles.title}>{name}</h1>
          {coach.experience && <p className={styles.subtitle}>{coach.experience}</p>}
        </div>
      </div>
      {coach.bio && (
        <div className={styles.prose} style={{ marginTop: 24 }}>
          <p>{coach.bio}</p>
        </div>
      )}
      <div style={{ marginTop: 32 }}>
        <Link href="/coaches"><Button variant="secondary">← Все тренеры</Button></Link>
      </div>
    </div>
  );
}
