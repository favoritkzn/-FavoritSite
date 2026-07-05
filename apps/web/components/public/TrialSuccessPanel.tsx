import Link from 'next/link';
import { Button } from '@favorit/ui';
import styles from './TrialSuccessPanel.module.css';

export interface TrialSubmission {
  id: string;
  childName: string;
  parentName: string;
  phone: string;
}

interface TrialSuccessPanelProps {
  submission: TrialSubmission;
  academyPhone?: string;
  onNewRequest: () => void;
}

export function TrialSuccessPanel({ submission, academyPhone, onNewRequest }: TrialSuccessPanelProps) {
  const shortId = submission.id.slice(-8).toUpperCase();

  return (
    <div className={styles.panel} id="trial-success" role="status" aria-live="polite">
      <div className={styles.header}>
        <div className={styles.icon} aria-hidden>✓</div>
        <div>
          <h2 className={styles.title}>Заявка принята!</h2>
          <p className={styles.lead}>
            Мы получили вашу заявку на пробное занятие. Администратор свяжется с вами по телефону
            в ближайшее время — обычно в течение рабочего дня.
          </p>
        </div>
      </div>

      <div className={styles.summary}>
        <div><strong>Ребёнок:</strong> {submission.childName}</div>
        <div><strong>Контакт:</strong> {submission.parentName} · {submission.phone}</div>
        <div className={styles.ref}>Номер заявки: {shortId}</div>
      </div>

      <p className={styles.nextTitle}>Что будет дальше</p>
      <ol className={styles.nextList}>
        <li>Мы перезвоним и согласуем дату бесплатной тренировки.</li>
        <li>Ребёнок приходит на пробное занятие — возьмите спортивную форму и сменную обувь.</li>
        <li>Если всё понравится — администратор запишет в группу и подскажет по абонементу.</li>
        <li>
          После записи в группу{' '}
          <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
            создайте личный кабинет
          </Link>
          {' '}— там расписание, посещаемость и оплата.
        </li>
      </ol>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onNewRequest}>
          Отправить ещё одну заявку
        </Button>
        {academyPhone && (
          <a href={`tel:${academyPhone.replace(/\D/g, '')}`} style={{ textDecoration: 'none' }}>
            <Button variant="secondary">Позвонить: {academyPhone}</Button>
          </a>
        )}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button variant="secondary">На главную</Button>
        </Link>
      </div>
    </div>
  );
}
