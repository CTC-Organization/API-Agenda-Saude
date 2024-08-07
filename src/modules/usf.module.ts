import { forwardRef, Module } from '@nestjs/common';
import { MongoPrismaService } from '../services/mongo-prisma.service';
import { UsfController } from '@/controllers/usf.controller';
import { MongoModule } from './mongo-prisma.module';
import { UsfService } from '@/services/usf.service';
import { UsfRepository } from '@/repositories/usf.repository';
import { UsfPrismaRepository } from '@/repositories/usf-prisma.repository';
import { AuthModule } from './auth.module';
import { EnvConfigModule } from './env-config.module';
import { HealthDistrictModule } from './health-district.module';

@Module({
    imports: [forwardRef(() => EnvConfigModule), AuthModule, MongoModule, HealthDistrictModule],
    controllers: [UsfController],
    providers: [
        MongoPrismaService,
        UsfService,
        {
            provide: UsfRepository,
            useClass: UsfPrismaRepository,
        },
    ],
    exports: [],
})
export class UsfModule {}
