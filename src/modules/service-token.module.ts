import { forwardRef, Module } from '@nestjs/common';
import { ServiceTokenService } from '../services/service-token.service';
import { ServiceTokenController } from '@/controllers/service-token.controller';
import { ServiceTokenPrismaRepository } from '../repositories/prisma/service-token-prisma.repository';
import { PrismaService } from '../services/prisma.service';
import { ServiceTokenRepository } from '@/repositories/service-token.repository';
import { PatientModule } from './patient.module';
import { AuthModule } from './auth.module';

@Module({
    imports: [forwardRef(() => PatientModule), forwardRef(() => AuthModule)],
    controllers: [ServiceTokenController],
    providers: [
        ServiceTokenService,
        PrismaService,
        {
            provide: ServiceTokenRepository,
            useClass: ServiceTokenPrismaRepository,
        },
        ServiceTokenPrismaRepository,
    ],
    exports: [ServiceTokenService, ServiceTokenRepository, ServiceTokenPrismaRepository],
})
export class ServiceTokenModule {}
