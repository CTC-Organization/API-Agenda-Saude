import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserRepository } from '@/user/user.repository';
import { UserPrismaRepository } from './repositories/user-prisma.repository';
import { PatientPrismaRepository } from './repositories/patient-prisma.repository';
import { PatientRepository } from '@/patient/patient.repository';
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
