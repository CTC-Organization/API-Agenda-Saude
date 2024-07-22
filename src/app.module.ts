import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { EnvConfigModule } from './config/env-config.module';
import { DatabaseModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { PatientModule } from './patient/patient.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [EnvConfigModule, AuthModule, DatabaseModule, UserModule, PatientModule, JwtModule],
})
export class AppModule {}
