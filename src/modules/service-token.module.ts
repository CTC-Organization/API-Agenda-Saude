import { Module } from '@nestjs/common';
import { ServiceTokenService } from '../services/service-token.service';
import { ServiceTokenController } from '@/controllers/service-token.controller';
import { ServiceTokenPrismaRepository } from '../repositories/service-token-prisma.repository';
import { PrismaService } from '../services/prisma.service';
import { ServiceTokenRepository } from '@/repositories/service-token.repository';
import { PatientModule } from './patient.module';
import { AuthModule } from './auth.module';

@Module({
    imports: [PatientModule, AuthModule], // Certifique-se de importar o PatientModule
    controllers: [ServiceTokenController],
    providers: [
        ServiceTokenService,
        PrismaService,
        {
            provide: ServiceTokenRepository,
            useClass: ServiceTokenPrismaRepository,
        },
    ],
    exports: [ServiceTokenService, ServiceTokenRepository],
})
export class ServiceTokenModule {}
