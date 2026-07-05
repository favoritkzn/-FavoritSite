"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcrypt.hash('password123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@favorit-kzn.ru' },
        update: {},
        create: {
            email: 'admin@favorit-kzn.ru',
            password: passwordHash,
            role: client_1.UserRole.ADMIN,
            status: client_1.UserStatus.ACTIVE,
            firstName: 'Елена',
            lastName: 'Директор',
            phone: '+79001234567',
        },
    });
    const coachUser = await prisma.user.upsert({
        where: { email: 'coach@favorit-kzn.ru' },
        update: {},
        create: {
            email: 'coach@favorit-kzn.ru',
            password: passwordHash,
            role: client_1.UserRole.COACH,
            status: client_1.UserStatus.ACTIVE,
            firstName: 'Алексей',
            lastName: 'Петров',
            phone: '+79001234568',
        },
    });
    const parentUser = await prisma.user.upsert({
        where: { email: 'parent@favorit-kzn.ru' },
        update: {},
        create: {
            email: 'parent@favorit-kzn.ru',
            password: passwordHash,
            role: client_1.UserRole.PARENT,
            status: client_1.UserStatus.ACTIVE,
            firstName: 'Мария',
            lastName: 'Иванова',
            phone: '+79001234569',
        },
    });
    const coach = await prisma.coach.upsert({
        where: { userId: coachUser.id },
        update: {},
        create: {
            userId: coachUser.id,
            bio: 'Мастер спорта, 10 лет опыта работы с детьми',
            experience: '10 лет',
            isPublic: true,
        },
    });
    const parent = await prisma.parent.upsert({
        where: { userId: parentUser.id },
        update: {},
        create: {
            userId: parentUser.id,
            address: 'г. Казань, ул. Баумана, 15',
        },
    });
    const groupU10 = await prisma.group.upsert({
        where: { id: 'group-u10' },
        update: {},
        create: {
            id: 'group-u10',
            name: 'U10 «Фаворит»',
            ageCategory: 'U10',
            description: 'Группа для детей 9-10 лет',
            maxCapacity: 20,
        },
    });
    const groupU12 = await prisma.group.upsert({
        where: { id: 'group-u12' },
        update: {},
        create: {
            id: 'group-u12',
            name: 'U12 «Фаворит»',
            ageCategory: 'U12',
            description: 'Группа для детей 11-12 лет',
            maxCapacity: 18,
        },
    });
    await prisma.groupCoach.upsert({
        where: { groupId_coachId: { groupId: groupU10.id, coachId: coach.id } },
        update: {},
        create: { groupId: groupU10.id, coachId: coach.id, isPrimary: true },
    });
    await prisma.groupCoach.upsert({
        where: { groupId_coachId: { groupId: groupU12.id, coachId: coach.id } },
        update: {},
        create: { groupId: groupU12.id, coachId: coach.id, isPrimary: false },
    });
    const child1 = await prisma.child.upsert({
        where: { id: 'child-ivan' },
        update: {},
        create: {
            id: 'child-ivan',
            firstName: 'Дмитрий',
            lastName: 'Иванов',
            birthDate: new Date('2015-03-15'),
            gender: client_1.Gender.MALE,
            medicalInfo: 'Нет аллергий',
        },
    });
    const child2 = await prisma.child.upsert({
        where: { id: 'child-sidorov' },
        update: {},
        create: {
            id: 'child-sidorov',
            firstName: 'Артём',
            lastName: 'Сидоров',
            birthDate: new Date('2013-07-22'),
            gender: client_1.Gender.MALE,
        },
    });
    await prisma.parentChild.upsert({
        where: { parentId_childId: { parentId: parent.id, childId: child1.id } },
        update: {},
        create: { parentId: parent.id, childId: child1.id, relation: 'MOTHER' },
    });
    await prisma.groupChild.upsert({
        where: { groupId_childId: { groupId: groupU10.id, childId: child1.id } },
        update: {},
        create: { groupId: groupU10.id, childId: child1.id },
    });
    await prisma.groupChild.upsert({
        where: { groupId_childId: { groupId: groupU12.id, childId: child2.id } },
        update: {},
        create: { groupId: groupU12.id, childId: child2.id },
    });
    const plan = await prisma.subscriptionPlan.upsert({
        where: { id: 'default-plan' },
        update: {},
        create: {
            id: 'default-plan',
            name: 'Абонемент 12 тренировок',
            description: '12 тренировок в месяц',
            price: 6000,
            sessions: 12,
            durationDays: 30,
        },
    });
    const planPremium = await prisma.subscriptionPlan.upsert({
        where: { id: 'premium-plan' },
        update: {},
        create: {
            id: 'premium-plan',
            name: 'Абонемент 16 тренировок',
            description: '16 тренировок в месяц — расширенный',
            price: 7500,
            sessions: 16,
            durationDays: 30,
        },
    });
    const now = new Date();
    const subEnd = new Date(now);
    subEnd.setDate(subEnd.getDate() + 30);
    const subscription = await prisma.subscription.upsert({
        where: { id: 'sub-ivan' },
        update: {},
        create: {
            id: 'sub-ivan',
            childId: child1.id,
            planId: plan.id,
            status: client_1.SubscriptionStatus.ACTIVE,
            startDate: now,
            endDate: subEnd,
            remainingSessions: 10,
            totalSessions: 12,
        },
    });
    await prisma.payment.upsert({
        where: { id: 'pay-ivan-1' },
        update: {},
        create: {
            id: 'pay-ivan-1',
            userId: parentUser.id,
            childId: child1.id,
            subscriptionId: subscription.id,
            amount: 6000,
            type: client_1.PaymentType.SUBSCRIPTION,
            status: client_1.PaymentStatus.SUCCEEDED,
            description: 'Оплата абонемента',
            externalId: 'mock_seed_payment_1',
            paidAt: now,
        },
    });
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 3);
    nextWeek.setHours(17, 0, 0, 0);
    const sessionEnd = new Date(nextWeek);
    sessionEnd.setHours(18, 30, 0, 0);
    await prisma.trainingSession.upsert({
        where: { id: 'session-u10-1' },
        update: {},
        create: {
            id: 'session-u10-1',
            groupId: groupU10.id,
            coachId: coach.id,
            title: 'Техника владения мячом',
            venue: 'Стадион «Фаворит», поле №2',
            startTime: nextWeek,
            endTime: sessionEnd,
            status: client_1.TrainingSessionStatus.SCHEDULED,
        },
    });
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(17, 0, 0, 0);
    const lastWeekEnd = new Date(lastWeek);
    lastWeekEnd.setHours(18, 30, 0, 0);
    const pastSession = await prisma.trainingSession.upsert({
        where: { id: 'session-u10-past' },
        update: {},
        create: {
            id: 'session-u10-past',
            groupId: groupU10.id,
            coachId: coach.id,
            title: 'Тактика и позиционирование',
            venue: 'Стадион «Фаворит», поле №2',
            startTime: lastWeek,
            endTime: lastWeekEnd,
            status: client_1.TrainingSessionStatus.COMPLETED,
        },
    });
    await prisma.attendance.upsert({
        where: { sessionId_childId: { sessionId: pastSession.id, childId: child1.id } },
        update: {},
        create: {
            sessionId: pastSession.id,
            childId: child1.id,
            status: 'PRESENT',
            markedBy: coachUser.id,
            markedAt: lastWeekEnd,
        },
    });
    await prisma.news.upsert({
        where: { slug: 'novyj-sezon-2026' },
        update: {},
        create: {
            title: 'Старт нового сезона 2026/27',
            slug: 'novyj-sezon-2026',
            excerpt: 'Приглашаем всех на открытую тренировку 15 сентября',
            content: 'Футбольная академия «Фаворит» объявляет о начале нового сезона. Открытая тренировка пройдёт 15 сентября на стадионе «Фаворит».',
            isPublished: true,
            publishedAt: now,
        },
    });
    await prisma.news.upsert({
        where: { slug: 'pobeda-v-turnire' },
        update: {},
        create: {
            title: 'Победа U10 на городском турнире',
            slug: 'pobeda-v-turnire',
            excerpt: 'Наша команда заняла 1 место среди 12 команд',
            content: 'Команда U10 «Фаворит» одержала победу на городском турнире среди детских команд.',
            isPublished: true,
            publishedAt: new Date(now.getTime() - 86400000 * 5),
        },
    });
    const category = await prisma.productCategory.upsert({
        where: { slug: 'forma' },
        update: {},
        create: {
            name: 'Форма',
            slug: 'forma',
            description: 'Игровая и тренировочная форма',
            sortOrder: 1,
        },
    });
    await prisma.product.upsert({
        where: { slug: 'futbolka-domashnyaya' },
        update: {},
        create: {
            categoryId: category.id,
            name: 'Футболка домашняя',
            slug: 'futbolka-domashnyaya',
            description: 'Красная домашняя футболка с логотипом клуба',
            price: 2500,
            stock: 50,
            imageUrl: '/images/products/home-jersey.jpg',
        },
    });
    await prisma.product.upsert({
        where: { slug: 'shorty-trenirovochnye' },
        update: {},
        create: {
            categoryId: category.id,
            name: 'Шорты тренировочные',
            slug: 'shorty-trenirovochnye',
            description: 'Чёрные тренировочные шорты',
            price: 1200,
            stock: 30,
        },
    });
    const album = await prisma.mediaAlbum.upsert({
        where: { id: 'album-u10-spring' },
        update: {},
        create: {
            id: 'album-u10-spring',
            title: 'U10 — Весенний турнир',
            description: 'Фото с весеннего турнира 2026',
            groupId: groupU10.id,
            isPublic: true,
            coverUrl: '/images/albums/u10-spring-cover.jpg',
        },
    });
    await prisma.media.upsert({
        where: { id: 'media-1' },
        update: {},
        create: {
            id: 'media-1',
            albumId: album.id,
            type: client_1.MediaType.IMAGE,
            url: '/images/albums/u10-spring-1.jpg',
            title: 'Команда после матча',
            uploadedById: coachUser.id,
        },
    });
    await prisma.media.upsert({
        where: { id: 'media-2' },
        update: {},
        create: {
            id: 'media-2',
            albumId: album.id,
            type: client_1.MediaType.IMAGE,
            url: '/images/albums/u10-spring-2.jpg',
            title: 'Гол в ворота соперника',
            uploadedById: coachUser.id,
        },
    });
    const match = await prisma.match.upsert({
        where: { id: 'match-1' },
        update: {},
        create: {
            id: 'match-1',
            title: 'U10 vs «Спартак»',
            opponent: 'Спартак',
            homeScore: 3,
            awayScore: 1,
            playedAt: new Date(now.getTime() - 86400000 * 14),
            venue: 'Стадион «Фаворит»',
            groupName: 'U10',
        },
    });
    await prisma.matchEvent.upsert({
        where: { id: 'event-goal-1' },
        update: {},
        create: {
            id: 'event-goal-1',
            matchId: match.id,
            childId: child1.id,
            type: client_1.MatchEventType.GOAL,
            minute: 23,
        },
    });
    await prisma.notification.upsert({
        where: { id: 'notif-1' },
        update: {},
        create: {
            id: 'notif-1',
            userId: parentUser.id,
            type: client_1.NotificationType.SCHEDULE,
            title: 'Ближайшая тренировка',
            message: 'Тренировка U10 состоится через 3 дня в 17:00',
            link: '/parent/schedule',
        },
    });
    await prisma.announcement.upsert({
        where: { id: 'announce-1' },
        update: {},
        create: {
            id: 'announce-1',
            groupId: groupU10.id,
            authorId: coachUser.id,
            title: 'Принести форму',
            content: 'На следующей тренировке нужна полная игровая форма.',
        },
    });
    await prisma.trialRegistration.upsert({
        where: { id: 'trial-1' },
        update: {},
        create: {
            id: 'trial-1',
            childName: 'Кирилл Козлов',
            parentName: 'Анна Козлова',
            phone: '+79009876543',
            email: 'kozlova@example.com',
            birthDate: new Date('2016-01-10'),
            notes: 'Хочет записаться в группу U10',
            status: client_1.TrialRegistrationStatus.NEW,
        },
    });
    await prisma.siteSettings.upsert({
        where: { key: 'academy' },
        update: {},
        create: {
            key: 'academy',
            value: {
                name: 'ФК «Фаворит»',
                city: 'Казань',
                phone: '+7 (843) 000-00-00',
                email: 'info@favorit-kzn.ru',
                address: 'г. Казань, ул. Спортивная, 1',
                social: {
                    vk: 'https://vk.com/favorit_kzn',
                    telegram: 'https://t.me/favorit_kzn',
                },
            },
        },
    });
    console.log('Seed completed:', {
        admin: admin.email,
        coach: coachUser.email,
        parent: parentUser.email,
        groups: [groupU10.name, groupU12.name],
        children: [child1.firstName, child2.firstName],
        plans: [plan.name, planPremium.name],
        password: 'password123',
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map