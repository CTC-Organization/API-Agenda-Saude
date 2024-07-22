import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PatientPrismaRepository } from '@/prisma/repositories/patient-prisma.repository';
import { PrismaService } from '@/prisma/prisma.service';
import { PatientRepository } from './patient.repository';

@Module({
    controllers: [PatientController],
    providers: [
        PatientService,
        PrismaService,
        {
            provide: PatientRepository,
            useClass: PatientPrismaRepository,
        },
    ],
    exports: [PatientService, PatientRepository],
})
export class PatientModule {}
