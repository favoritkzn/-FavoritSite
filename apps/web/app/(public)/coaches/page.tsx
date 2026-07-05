'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@favorit/types';
import { Avatar, EmptyState, Skeleton } from '@favorit/ui';
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

export default function CoachesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['coaches', 'public'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Coach[]>>('/coaches/public', { auth: false });
      return res.data ?? [];
    },
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Наши тренеры</h1>
      <p className={styles.subtitle}>
        Люди, которые каждый день работают с детьми — терпеливо, профессионально
        и с настоящей любовью к футболу
      </p>

      {isLoading && (
        <div className={styles.skeletonGrid}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rect" height={180} />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState title="Не удалось загрузить тренеров" description="Попробуйте обновить страницу" />
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState title="Пока нет тренеров" description="Информация появится после добавления тренеров администратором" />
      )}

      {data && data.length > 0 && (
        <div className={styles.grid}>
          {data.map((coach) => {
            const name = fullName(coach.user.firstName, coach.user.lastName);
            return (
              <Link key={coach.id} href={`/coaches/${coach.id}`} className={styles.card}>
                <Avatar src={coach.photo} name={name} size="lg" />
                <h3 className={styles.cardTitle}>{name}</h3>
                <p className={styles.cardMeta}>
                  {coach.experience ?? coach.bio ?? 'Тренер ФК «Фаворит»'}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
