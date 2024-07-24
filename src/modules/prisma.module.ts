import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { UserRepository } from '../repositories/user.repository';
import { UserPrismaRepository } from '@/repositories/user-prisma.repository';
import { PatientPrismaRepository } from '@/repositories/patient-prisma.repository';
import { PatientRepository } from '@/repositories/patient.repository';
@Global()
@Module({
    providers: [
        PrismaService,
        {
            provide: UserRepository,
            useClass: UserPrismaRepository,
        },
        {
            provide: PatientRepository,
            useClass: PatientPrismaRepository,
        },
    ],
    exports: [UserRepository, PatientRepository, PrismaService],
})
export class DatabaseModule {}
