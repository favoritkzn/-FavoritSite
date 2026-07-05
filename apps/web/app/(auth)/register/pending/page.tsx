import Link from 'next/link';
import { ClientJourneyGuide } from '@/components/public/ClientJourneyGuide';
import authStyles from '../../auth.module.css';

export const metadata = { title: 'Аккаунт на проверке' };

export default function RegisterPendingPage() {
  return (
    <>
      <div className={authStyles.authHeader}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--color-success-light)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 700,
            margin: '0 auto 20px',
          }}
          aria-hidden
        >
          ✓
        </div>
        <h1 className={authStyles.title}>Заявка на кабинет отправлена</h1>
        <p className={authStyles.subtitle}>
          Мы получили ваши данные. Администратор проверит их и активирует аккаунт — после этого
          вы сможете войти по email и паролю.
        </p>
      </div>

      <div
        style={{
          padding: '16px 18px',
          marginBottom: 24,
          borderRadius: 12,
          background: 'var(--color-background)',
          border: '1px solid var(--color-border-subtle)',
          fontSize: 14,
          lineHeight: 1.65,
          color: 'var(--color-text-secondary)',
        }}
      >
        <p style={{ margin: '0 0 12px', fontWeight: 600, color: 'var(--color-text)' }}>Что дальше</p>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Администратор сверит данные ребёнка с записью в академии.</li>
          <li>Обычно подтверждение занимает до одного рабочего дня.</li>
          <li>После подтверждения зайдите на страницу входа — кабинет будет доступен.</li>
        </ol>
      </div>

      <div style={{ marginBottom: 24 }}>
        <ClientJourneyGuide activeStep={3} completedThrough={2} />
      </div>

      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
        <strong>Впервые у нас?</strong> Сначала{' '}
        <Link href="/contacts#trial-form" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
          запишитесь на пробное занятие
        </Link>
        . Личный кабинет нужен, когда ребёнок уже занимается в группе.
      </p>

      <Link href="/login" className={authStyles.link}>
        Перейти ко входу
      </Link>
    </>
  );
}
