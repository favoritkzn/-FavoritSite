'use client';

import Link from 'next/link';
import { UserRole } from '@favorit/types';
import { Button } from '@favorit/ui';
import styles from './AdminTrialAlert.module.css';

interface AdminTrialAlertProps {
  count: number;
}

export function AdminTrialAlert({ count }: AdminTrialAlertProps) {
  if (count <= 0) return null;

  const label =
    count === 1
      ? '1 новая заявка на пробное занятие'
      : `${count} новых заявок на пробное занятие`;

  return (
    <div className={styles.banner} role="status">
      <div>
        <strong>{label}</strong>
        <p className={styles.text}>
          Заявки с формы на сайте — не путать с регистрацией личного кабинета.
        </p>
      </div>
      <Link href="/admin/trial">
        <Button size="sm">Открыть заявки</Button>
      </Link>
    </div>
  );
}
