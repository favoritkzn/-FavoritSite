import Link from 'next/link';
import { RedCircles } from '@/components/brand/RedCircles';
import { Logo } from '@/components/brand/Logo';
import { fetchCms } from '@/lib/cms';
import styles from '@/styles/public.module.css';

interface HomeCms {
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  stats?: Array<{ value: string; label: string; desc: string }>;
  programs?: Array<{ title: string; age: string; desc: string }>;
  features?: Array<{ num: string; title: string; desc: string }>;
  ctaTitle?: string;
  ctaText?: string;
}

const DEFAULT_FEATURES = [
  {
    num: '1',
    title: 'Личный кабинет',
    desc: 'Родители видят расписание и посещаемость ребёнка.',
  },
  {
    num: '2',
    title: 'Просто для тренеров',
    desc: 'Отметить присутствие и записать результат матча — за пару минут.',
  },
];

export default async function HomePage() {
  const cms = await fetchCms<HomeCms>('home');
  const heroTitleLines = (cms?.heroTitle ?? 'Учим играть\nв футбол').split('\n');
  const stats = cms?.stats ?? [];
  const programs = cms?.programs ?? [];
  const features = cms?.features ?? DEFAULT_FEATURES;

  return (
    <>
      <section className={styles.hero}>
        <RedCircles variant="hero" />
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <p className={styles.heroBadge}>{cms?.heroBadge ?? 'Футбольная академия · Казань'}</p>
            <h1 className={styles.heroTitle}>
              {heroTitleLines[0]}
              {heroTitleLines[1] && (
                <>
                  <br />
                  <span>{heroTitleLines[1]}</span>
                </>
              )}
            </h1>
            <p className={styles.heroSubtitle}>
              {cms?.heroSubtitle ?? '«Фаворит» — детская футбольная академия в Казани.'}
            </p>
            <div className={styles.heroActions}>
              <Link href="/contacts#trial-form" className={styles.btnPrimary}>Записаться на пробное</Link>
              <Link href="/about" className={styles.btnSecondary}>Узнать о школе</Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroShield}>
              <Logo variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className={styles.statsBar}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statItem}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statDesc}>{stat.desc}</span>
            </div>
          ))}
        </section>
      )}

      {programs.length > 0 && (
        <section className={styles.programs}>
          <RedCircles variant="page" />
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Группы по возрасту</h2>
            <p className={styles.sectionSubtitle}>
              Каждый ребёнок занимается со сверстниками — программа подобрана с учётом развития
            </p>
          </div>
          <div className={styles.programGrid}>
            {programs.map((program) => (
              <article key={program.title} className={styles.programCard}>
                <span className={styles.programAge}>{program.age}</span>
                <h3 className={styles.programTitle}>{program.title}</h3>
                <p className={styles.programDesc}>{program.desc}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={styles.features}>
        {features.map((f) => (
          <div key={f.num} className={styles.featureCard}>
            <span className={styles.featureNum}>{f.num}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <RedCircles variant="cta" />
          <h2 className={styles.ctaTitle}>{cms?.ctaTitle ?? 'Запишитесь на пробное занятие'}</h2>
          <p className={styles.ctaText}>{cms?.ctaText ?? 'Бесплатная тренировка — мы перезвоним и подберём группу.'}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Link href="/contacts#trial-form" className={styles.ctaBtn}>Записаться на пробное</Link>
            <Link href="/register" className={styles.btnSecondary} style={{ padding: '14px 28px', borderRadius: 999, textDecoration: 'none' }}>
              Личный кабинет
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
