import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { EnvConfigModule } from './config/env-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [EnvConfigModule, AuthModule, PrismaModule, UserModule],
})
export class AppModule {}
