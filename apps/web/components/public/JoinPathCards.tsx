import Link from 'next/link';
import styles from './JoinPathCards.module.css';

interface JoinPathCardsProps {
  trialHref?: string;
}

export function JoinPathCards({ trialHref = '#trial-form' }: JoinPathCardsProps) {
  return (
    <div className={styles.grid}>
      <a href={trialHref} className={`${styles.card} ${styles.cardPrimary}`}>
        <span className={styles.badge}>Шаг 1 · Впервые</span>
        <h2 className={styles.title}>Пробное занятие</h2>
        <p className={styles.desc}>
          Бесплатная тренировка для знакомства с академией. Мы перезвоним и подберём группу по возрасту.
        </p>
        <ul className={styles.points}>
          <li>Только имя, телефон и возраст ребёнка</li>
          <li>Без пароля и без личного кабинета</li>
        </ul>
        <span className={styles.cta}>Заполнить форму ниже ↓</span>
      </a>

      <Link href="/register" className={`${styles.card} ${styles.cardSecondary}`}>
        <span className={`${styles.badge} ${styles.badgeMuted}`}>Шаг 2 · Уже занимаемся</span>
        <h2 className={styles.title}>Личный кабинет</h2>
        <p className={styles.desc}>
          Для родителей, чей ребёнок уже записан в академию. Расписание, посещаемость и оплата — в одном месте.
        </p>
        <ul className={styles.points}>
          <li>Email и пароль для входа</li>
          <li>Доступ после подтверждения администратором</li>
        </ul>
        <span className={styles.cta}>Создать аккаунт →</span>
      </Link>
    </div>
  );
}
