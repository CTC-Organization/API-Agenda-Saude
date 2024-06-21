import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { EnvConfigModule } from './config/env-config.module';
import { DatabaseModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ScheduleReferralModule } from './schedule-referral/scheduleReferral.module';

@Module({
    imports: [EnvConfigModule, AuthModule, DatabaseModule, UserModule, ScheduleReferralModule],
})
export class AppModule {}
