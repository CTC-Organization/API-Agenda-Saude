import { Module } from '@nestjs/common';
import { EnvConfigModule } from './env-config.module';
import { PrismaService } from '@/services/prisma.service';
import { AttachmentPrismaRepository } from '@/repositories/attachment-prisma.repository';
import { PatientPrismaRepository } from '@/repositories/patient-prisma.repository';
@Module({
    imports: [EnvConfigModule], // Importe o ConfigModule aqui
    providers: [AttachmentPrismaRepository, PrismaService, PatientPrismaRepository],
    exports: [AttachmentPrismaRepository],
})
export class AttachmentModule {}
