'use client';

import { useRouter } from 'next/navigation';
import { UserRole } from '@favorit/types';
import { Button, Card, Input } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { useAuthUser } from '@/hooks/useAuthUser';
import { logout } from '@/lib/auth';
import styles from '@/styles/cabinet.module.css';

export default function CoachSettingsPage() {
  const router = useRouter();
  const { data: user } = useAuthUser();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <DashboardShell role={UserRole.COACH} title="Настройки">
      <h1 className={styles.pageTitle}>Настройки</h1>
      <Card title="Профиль">
        <div className={styles.form} style={{ marginTop: 16 }}>
          <Input label="Имя" value={user?.firstName ?? ''} readOnly />
          <Input label="Фамилия" value={user?.lastName ?? ''} readOnly />
          <Input label="Email" value={user?.email ?? ''} readOnly />
          <Input label="Телефон" value={user?.phone ?? ''} readOnly />
        </div>
      </Card>
      <div style={{ marginTop: 24 }}>
        <Button variant="secondary" onClick={handleLogout}>
          Выйти из аккаунта
        </Button>
      </div>
    </DashboardShell>
  );
}
