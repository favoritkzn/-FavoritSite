import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function clearOperationalData() {
  await prisma.attendance.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.match.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.media.deleteMany();
  await prisma.mediaAlbum.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.trainingSession.deleteMany();
  await prisma.groupChild.deleteMany();
  await prisma.parentChild.deleteMany();
  await prisma.groupCoach.deleteMany();
  await prisma.child.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.group.deleteMany();
  await prisma.news.deleteMany();
  await prisma.trialRegistration.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany({ where: { role: { not: UserRole.ADMIN } } });
}

async function main() {
  await clearOperationalData();

  const passwordHash = await bcrypt.hash('Favorit2026!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@favorit-kzn.ru' },
    update: {
      password: passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      firstName: 'Елена',
      lastName: 'Директор',
    },
    create: {
      email: 'admin@favorit-kzn.ru',
      password: passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      firstName: 'Елена',
      lastName: 'Директор',
      phone: '+7 (843) 200-00-01',
    },
  });

  await prisma.siteSettings.upsert({
    where: { key: 'academy' },
    update: {
      value: {
        name: 'ФК «Фаворит»',
        city: 'Казань',
        phone: '+7 (843) 200-00-01',
        email: 'info@favorit-kzn.ru',
        address: 'г. Казань, ул. Спортивная, 1',
        paymentCard: '2202 2082 5979 0732',
        paymentCardHolder: 'ФК «Фаворит»',
        paymentInstructions:
          'Переведите сумму на карту. В комментарии к переводу укажите фамилию ребёнка. После оплаты нажмите «Я оплатил» в личном кабинете — администратор проверит поступление и активирует абонемент.',
        social: {
          vk: 'https://vk.com/favorit_kzn',
          telegram: 'https://t.me/favorit_kzn',
        },
      },
    },
    create: {
      key: 'academy',
      value: {
        name: 'ФК «Фаворит»',
        city: 'Казань',
        phone: '+7 (843) 200-00-01',
        email: 'info@favorit-kzn.ru',
        address: 'г. Казань, ул. Спортивная, 1',
        paymentCard: '2202 2082 5979 0732',
        paymentCardHolder: 'ФК «Фаворит»',
        paymentInstructions:
          'Переведите сумму на карту. В комментарии к переводу укажите фамилию ребёнка. После оплаты нажмите «Я оплатил» в личном кабинете — администратор проверит поступление и активирует абонемент.',
        social: {
          vk: 'https://vk.com/favorit_kzn',
          telegram: 'https://t.me/favorit_kzn',
        },
      },
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { id: 'plan-12' },
    update: { isActive: true },
    create: {
      id: 'plan-12',
      name: 'Абонемент 12 тренировок',
      sessions: 12,
      price: 6000,
      durationDays: 60,
      description: '12 тренировок в течение 2 месяцев',
      isActive: true,
    },
  });

  await prisma.siteSettings.upsert({
    where: { key: 'home' },
    update: {},
    create: {
      key: 'home',
      value: {
        heroBadge: 'Футбольная академия · Казань',
        heroTitle: 'Учим играть\nв футбол',
        heroSubtitle:
          '«Фаворит» — детская футбольная академия. Тренировки, посещаемость и расписание — в личном кабинете.',
        features: [
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
        ],
        ctaTitle: 'Запишитесь на пробное занятие',
        ctaText: 'Оставьте заявку — мы свяжемся и подберём группу.',
      },
    },
  });

  await prisma.siteSettings.upsert({
    where: { key: 'about' },
    update: {},
    create: {
      key: 'about',
      value: {
        title: 'О школе «Фаворит»',
        subtitle: 'Детская футбольная академия в Казани.',
        blocks: [
          {
            title: 'Как мы тренируем',
            text: 'Занятия строятся через игру: техника, командная работа и удовольствие от футбола.',
          },
          {
            title: 'Где проходят занятия',
            text: 'Тренировки на полях Казани. Адрес конкретной группы сообщим после записи.',
          },
        ],
      },
    },
  });

  console.log('Seed completed.');
  console.log('Admin login:', admin.email, '/ Favorit2026!');
  console.log('Тренеров и учеников добавляет администратор. Родители регистрируются на сайте.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
