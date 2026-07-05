import styles from './RedCircles.module.css';

type Variant = 'hero' | 'page' | 'footer' | 'cta';

interface RedCirclesProps {
  variant?: Variant;
}

export function RedCircles({ variant = 'page' }: RedCirclesProps) {
  return (
    <div className={`${styles.root} ${styles[variant]}`} aria-hidden>
      <span className={`${styles.circle} ${styles.c1}`} />
      <span className={`${styles.circle} ${styles.c2}`} />
      <span className={`${styles.circle} ${styles.c3}`} />
      <span className={`${styles.circle} ${styles.c4}`} />
      <span className={`${styles.circle} ${styles.c5}`} />
    </div>
  );
}
