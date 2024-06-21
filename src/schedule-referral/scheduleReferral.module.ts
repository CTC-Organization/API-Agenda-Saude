import { Module } from '@nestjs/common';
import { ScheduleReferralService } from './scheduleReferral.service';
import { ScheduleReferralController } from './scheduleReferral.controller';

@Module({
    controllers: [ScheduleReferralController],
    providers: [ScheduleReferralService],
})
export class ScheduleReferralModule {}
