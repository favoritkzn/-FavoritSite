'use client';

import Link from 'next/link';
import { useState } from 'react';
import { UserRole } from '@favorit/types';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ProgressBar,
  Skeleton,
} from '@favorit/ui';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { DashboardShell } from '@/components/DashboardShell';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuthUser } from '@/hooks/useAuthUser';
import { getGreeting } from '@/lib/auth';
import { calcAge, formatDate, formatTimeRange, fullName } from '@/lib/format';
import type { ParentDashboardStats } from '@/hooks/useDashboard';
import styles from './dashboard.module.css';

export default function ParentDashboard() {
  const { data: user } = useAuthUser();
  const { data: stats, isLoading } = useDashboard();
  const parentStats = stats as ParentDashboardStats | undefined;
  const children = parentStats?.children ?? [];
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const activeId = activeChildId ?? children[0]?.id ?? null;
  const activeChild = children.find((c) => c.id === activeId);
  const nextSession = parentStats?.upcomingSessions[0];
  const activeSub = activeChild?.subscriptions[0];
  const parentName = user ? user.firstName : 'Родитель';

  if (isLoading) {
    return (
      <DashboardShell role={UserRole.PARENT} title="Главная">
        <Skeleton variant="title" width="50%" />
        <div className={styles.grid}>
          <Skeleton variant="rect" height={200} />
          <Skeleton variant="rect" height={200} />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role={UserRole.PARENT} title="Главная">
      <h1 className={styles.greeting}>
        {getGreeting()}, {parentName}! 👋
      </h1>

      {children.length === 0 ? (
        <EmptyState title="Дети не привязаны" description="Обратитесь к администратору академии" />
      ) : (
        <>
          {children.length > 1 && (
            <div className={styles.childSwitcher}>
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  className={`${styles.childTab} ${child.id === activeId ? styles.childTabActive : ''}`}
                  onClick={() => setActiveChildId(child.id)}
                >
                  {child.firstName}
                </button>
              ))}
            </div>
          )}

          <div className={styles.grid}>
            {activeChild && (
              <Card title="Профиль ребёнка" hoverable>
                <div className={styles.childCard}>
                  <Avatar src={activeChild.photo} name={fullName(activeChild.firstName, activeChild.lastName)} size="lg" />
                  <div className={styles.childInfo}>
                    <h3>{fullName(activeChild.firstName, activeChild.lastName)}</h3>
                    <p className={styles.childMeta}>
                      {activeChild.groups[0]?.group.name ?? 'Без группы'} · {calcAge(activeChild.birthDate)} лет
                    </p>
                    <Link href={`/parent/children/${activeChild.id}`} className={styles.cardLink}>
                      Подробнее <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            <Card title="Ближайшее событие" hoverable>
              {nextSession ? (
                <>
                  <div className={styles.eventBadge}>⚽ {nextSession.title ?? 'Тренировка'}</div>
                  <p className={styles.eventTime}>
                    {formatTimeRange(nextSession.startTime, nextSession.endTime)}
                  </p>
                  <p className={styles.eventMeta}>
                    {nextSession.venue} · {nextSession.group.name}
                  </p>
                </>
              ) : (
                <p className={styles.eventMeta}>Нет предстоящих занятий</p>
              )}
              <Link href="/parent/schedule" className={styles.cardLink}>
                Расписание <ArrowRight size={14} />
              </Link>
            </Card>

            <Card title="Абонемент">
              {activeSub ? (
                <>
                  <ProgressBar
                    value={activeSub.remainingSessions}
                    max={activeSub.plan.sessions}
                    label="Осталось тренировок"
                  />
                  <div className={styles.subscriptionFooter}>
                    <span className={styles.expiry}>
                      Действует до {formatDate(activeSub.endDate)}
                    </span>
                    <Link href="/parent/payments/new">
                      <Button size="sm">Оплатить</Button>
                    </Link>
                  </div>
                </>
              ) : (
                <p className={styles.eventMeta}>Нет активного абонемента</p>
              )}
            </Card>

            <Card title="Медиа">
              <p className={styles.photoCaption}>Фото с тренировок и матчей</p>
              <Link href="/parent/media" className={styles.cardLink}>
                Смотреть все <ArrowRight size={14} />
              </Link>
            </Card>
          </div>

          <div className={styles.quickActions}>
            <Link href="/parent/payments/new" className={styles.quickAction}>
              <CreditCard className={styles.quickActionIcon} />
              Оплатить
            </Link>
            <Link href="/parent/schedule" className={styles.quickAction}>
              <Calendar className={styles.quickActionIcon} />
              Расписание
            </Link>
            <Link href="/parent/attendance" className={styles.quickAction}>
              <BarChart3 className={styles.quickActionIcon} />
              Посещаемость
            </Link>
            <Link href="/parent/notifications" className={styles.quickAction}>
              <Bell className={styles.quickActionIcon} />
              Уведомления
            </Link>
          </div>

          <Link href="/news" className={styles.newsBanner}>
            <span className={styles.newsIcon}>🏆</span>
            <div>
              <p className={styles.newsTitle}>Новости академии</p>
              <p className={styles.newsDate}>Следите за достижениями</p>
            </div>
            <Badge variant="primary">Новость</Badge>
          </Link>
        </>
      )}
    </DashboardShell>
  );
}
