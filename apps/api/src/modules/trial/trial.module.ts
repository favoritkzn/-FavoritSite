import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { TrialController } from './trial.controller';
import { TrialService } from './trial.service';

@Module({
  imports: [NotificationsModule],
  controllers: [TrialController],
  providers: [TrialService],
  exports: [TrialService],
})
export class TrialModule {}
