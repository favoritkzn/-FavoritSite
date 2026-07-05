import { RedCircles } from '@/components/brand/RedCircles';
import { fetchCms } from '@/lib/cms';
import styles from '@/styles/public.module.css';

interface AboutCms {
  title?: string;
  subtitle?: string;
  blocks?: Array<{ title: string; text: string }>;
}

export const metadata = { title: 'О школе' };

export default async function AboutPage() {
  const cms = await fetchCms<AboutCms>('about');

  return (
    <div className={styles.pageWrap}>
      <RedCircles variant="page" />
      <div className={styles.container}>
        <h1 className={styles.title}>{cms?.title ?? 'О школе «Фаворит»'}</h1>
        <p className={styles.subtitle}>
          {cms?.subtitle ?? 'Детская футбольная академия в Казани.'}
        </p>

        <div className={styles.aboutGrid}>
          {(cms?.blocks ?? [
            { title: 'Как мы тренируем', text: 'Занятия строятся по методике «игра — основа обучения».' },
            { title: 'Где проходят занятия', text: 'Тренировки — на полях и в залах Казани.' },
          ]).map((block) => (
            <div key={block.title} className={styles.aboutBlock}>
              <h3>{block.title}</h3>
              <p>{block.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
