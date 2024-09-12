import { RequestPrismaRepository } from '@/repositories/prisma/request-prisma.repository';
import { RequestService } from '@/services/request.service';
import { forwardRef, Global, Module } from '@nestjs/common';
import { PrismaService } from '@/services/prisma.service';
import { RequestController } from '@/controllers/request.controller';
import { ServiceTokenModule } from './service-token.module';
import { PatientModule } from './patient.module';
import { RequestRepository } from '@/repositories/request.repository';
import { AttachmentModule } from './attachment.module';
import { AuthModule } from './auth.module';
import { MobileDeviceModule } from './mobile-device.module';

@Module({
    imports: [
        forwardRef(() => AuthModule),
        forwardRef(() => AttachmentModule),
        forwardRef(() => PatientModule),
        ServiceTokenModule,
        MobileDeviceModule,
    ],
    controllers: [RequestController],
    providers: [
        PrismaService,
        RequestService,
        RequestPrismaRepository,
        { provide: RequestRepository, useClass: RequestPrismaRepository },
    ],
    exports: [
        RequestService,
        RequestPrismaRepository,
        { provide: RequestRepository, useClass: RequestPrismaRepository },
    ],
})
export class RequestModule {}
