import { forwardRef, Module } from '@nestjs/common';
import { MongoPrismaService } from '../services/mongo-prisma.service';
import { HealthDistrictController } from '@/controllers/health-district.controller';
import { MongoModule } from './mongo-prisma.module';
import { HealthDistrictService } from '@/services/health-district.service';
import { HealthDistrictRepository } from '@/repositories/health-district.repository';
import { HealthDistrictPrismaRepository } from '@/repositories/health-district-prisma.repository';
import { AuthModule } from './auth.module';
import { EnvConfigModule } from './env-config.module';

@Module({
    imports: [forwardRef(() => EnvConfigModule), MongoModule, AuthModule],
    controllers: [HealthDistrictController],
    providers: [
        MongoPrismaService,
        HealthDistrictService,
        HealthDistrictPrismaRepository,
        {
            provide: HealthDistrictRepository,
            useClass: HealthDistrictPrismaRepository,
        },
    ],
    exports: [
        HealthDistrictPrismaRepository,
        {
            provide: HealthDistrictRepository,
            useClass: HealthDistrictPrismaRepository,
        },
    ],
})
export class HealthDistrictModule {}
