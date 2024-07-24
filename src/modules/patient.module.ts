import { forwardRef, Module } from '@nestjs/common';
import { PatientService } from '../services/patient.service';
import { PatientController } from '@/controllers/patient.controller';
import { PatientPrismaRepository } from '../repositories/patient-prisma.repository';
import { PrismaService } from '../services/prisma.service';
import { PatientRepository } from '@/repositories/patient.repository';
import { AuthModule } from './auth.module';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [PatientController],
    providers: [
        PatientService,
        PrismaService,
        PatientPrismaRepository, // Adicionado aos providers
        {
            provide: PatientRepository,
            useClass: PatientPrismaRepository,
        },
    ],
    exports: [PatientService, PatientRepository, PatientPrismaRepository],
})
export class PatientModule {}
