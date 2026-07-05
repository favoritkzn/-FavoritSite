import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { ChildrenModule } from './modules/children/children.module';
import { CoachesModule } from './modules/coaches/coaches.module';
import { ParentsModule } from './modules/parents/parents.module';
import { GroupsModule } from './modules/groups/groups.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MatchesModule } from './modules/matches/matches.module';
import { MediaModule } from './modules/media/media.module';
import { NewsModule } from './modules/news/news.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { ShopModule } from './modules/shop/shop.module';
import { TrialModule } from './modules/trial/trial.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CmsModule } from './modules/cms/cms.module';
import { MailModule } from './common/mail/mail.module';
import { YooKassaModule } from './common/yukassa/yukassa.module';
import { StorageModule } from './common/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MailModule,
    YooKassaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    HealthModule,
    ChildrenModule,
    CoachesModule,
    ParentsModule,
    GroupsModule,
    ScheduleModule,
    AttendanceModule,
    SubscriptionsModule,
    PaymentsModule,
    MatchesModule,
    MediaModule,
    NewsModule,
    NotificationsModule,
    AnnouncementsModule,
    ShopModule,
    TrialModule,
    DashboardModule,
    CmsModule,
  ],
})
export class AppModule {}
