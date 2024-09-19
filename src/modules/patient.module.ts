import { forwardRef, Module } from '@nestjs/common';
import { PatientService } from '../services/patient.service';
import { PatientController } from '@/controllers/patient.controller';
import { PatientPrismaRepository } from '../repositories/prisma/patient-prisma.repository';
import { PrismaService } from '../services/prisma.service';
import { PatientRepository } from '@/repositories/patient.repository';
import { AuthModule } from './auth.module';
import { AttachmentModule } from './attachment.module';
import { UploadModule } from './upload.module';

@Module({
    imports: [forwardRef(() => AuthModule), forwardRef(() => UploadModule)],
    controllers: [PatientController],
    providers: [
        PatientService,
        PrismaService,
        PatientPrismaRepository,
        {
            provide: PatientRepository,
            useClass: PatientPrismaRepository,
        },
    ],
    exports: [PatientService, PatientRepository, PatientPrismaRepository],
})
export class PatientModule {}
