import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <span className={styles.icon}>⚽</span>
        <h1>Эта страница не на поле</h1>
        <p>Похоже, мяч улетел за пределы площадки. Вернитесь на главную.</p>
        <Link href="/" className={styles.btn}>
          На главную
        </Link>
      </div>
    </div>
  );
}
