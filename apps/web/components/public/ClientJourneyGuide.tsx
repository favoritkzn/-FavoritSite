import styles from './ClientJourneyGuide.module.css';

type JourneyStep = 1 | 2 | 3;

interface ClientJourneyGuideProps {
  activeStep?: JourneyStep;
  completedThrough?: JourneyStep;
}

const STEPS = [
  {
    num: 1,
    title: 'Пробное занятие',
    text: 'Оставьте заявку на сайте. Мы перезвоним и пригласим на бесплатную тренировку.',
  },
  {
    num: 2,
    title: 'Запись в группу',
    text: 'После пробного администратор записывает ребёнка в группу и оформляет абонемент.',
  },
  {
    num: 3,
    title: 'Личный кабинет',
    text: 'Создайте аккаунт на сайте. Администратор подтвердит — и вы увидите расписание и оплату.',
  },
] as const;

export function ClientJourneyGuide({ activeStep = 1, completedThrough }: ClientJourneyGuideProps) {
  return (
    <section className={styles.wrap} aria-label="Как начать заниматься">
      <h2 className={styles.heading}>Как это работает — 3 шага</h2>
      <div className={styles.steps}>
        {STEPS.map((step) => {
          const isDone = completedThrough !== undefined && step.num <= completedThrough;
          const isActive = step.num === activeStep && !isDone;
          return (
            <div
              key={step.num}
              className={[
                styles.step,
                isActive ? styles.stepActive : '',
                isDone ? styles.stepDone : '',
              ].filter(Boolean).join(' ')}
            >
              <span className={styles.stepNum}>{isDone ? '✓' : step.num}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
