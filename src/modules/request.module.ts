import { Module } from '@nestjs/common';
import { RequestService } from '../services/request.service';
import { RequestController } from '@/controllers/request.controller';
import { RequestPrismaRepository } from '../repositories/request-prisma.repository';
import { PrismaService } from '../services/prisma.service';
import { RequestRepository } from '@/repositories/request.repository';
import { PatientModule } from './patient.module';
import { AuthModule } from './auth.module';

@Module({
    imports: [PatientModule, AuthModule], // Certifique-se de importar o PatientModule
    controllers: [RequestController],
    providers: [
        RequestService,
        PrismaService,
        {
            provide: RequestRepository,
            useClass: RequestPrismaRepository,
        },
    ],
    exports: [RequestService, RequestRepository],
})
export class RequestModule {}
