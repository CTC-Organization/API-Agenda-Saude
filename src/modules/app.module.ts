import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { EnvConfigModule } from './env-config.module';
import { DatabaseModule } from './prisma.module';
import { ServiceTokenModule } from './service-token.module';
import { UserModule } from './user.module';
import { PatientModule } from './patient.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from '../commons/guards/role.guard';
import { AttachmentModule } from './attachment.module';
import { RequestModule } from './request.module';
import { MongoModule } from './mongo-prisma.module';
import { HealthDistrictModule } from './health-district.module';
import { UsfModule } from './usf.module';

@Module({
    imports: [
        EnvConfigModule,
        JwtModule,
        AuthModule,
        DatabaseModule,
        MongoModule,
        UserModule,
        PatientModule,
        ServiceTokenModule,
        RequestModule,
        AttachmentModule,
        HealthDistrictModule,
        UsfModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: RoleGuard,
        },
    ],
})
export class AppModule {}
