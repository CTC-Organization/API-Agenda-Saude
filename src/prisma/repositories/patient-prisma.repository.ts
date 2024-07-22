import { BadRequestException, Injectable } from '@nestjs/common';
import { UserPrismaRepository } from './user-prisma.repository';
import { PrismaService } from '../prisma.service';
import { excludeFieldsInEntity } from '../../utils/exclude-fields';
import { PatientRepository } from '@/patient/patient.repository';
import { CreatePatient, Patient } from '@/interfaces/patient';
import { CreatePatientDto } from '@/patient/dto/create-patient.dto';
import { UpdatePatientDto } from '@/patient/dto/update-patient.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class PatientPrismaRepository extends UserPrismaRepository implements PatientRepository {
    constructor(public prisma: PrismaService) {
        super(prisma);
    }

    async createPatient({
        email,
        password,
        cpf,
        name,
        phoneNumber,
        role,
    }: CreatePatient): Promise<Patient> {
        return await this.prisma.$transaction(async (prisma) => {
            const newUser = await prisma.user.create({
                data: {
                    email,
                    password,
                    cpf,
                    name,
                    phoneNumber,
                    role,
                },
            });
            const newPatient = await prisma.patient.create({
                data: {
                    userId: newUser.id,
                },
            });
            return {
                id: newPatient.id,
                cpf: newUser.cpf,
                email: newUser.email || '', // Garante que o email nunca seja undefined
                name: newUser.name || '', // Garante que o name nunca seja undefined
                phoneNumber: newUser.phoneNumber || '', // Garante que o phoneNumber nunca seja undefined
                role: newUser.role || UserRole.PATIENT, // Assume um valor padrão para role se não fornecido
                password: '',
            };
        });
    }

    async findPatientByEmail(email: string): Promise<Patient | null> {
        const result = await this.prisma.user.findFirst({
            where: {
                email,
            },
            include: {
                patients: true,
            },
        });

        return result;
    }

    async findPatientByCpf(cpf: string): Promise<Patient | null> {
        const result = await this.prisma.user.findFirst({
            where: {
                cpf,
            },
            include: {
                patients: true,
            },
        });

        return result;
    }
    async findPatientById(id: string): Promise<Patient | null> {
        const result = await this.prisma.user.findFirst({
            where: {
                id,
            },
            include: {
                patients: true,
            },
        });

        return result;
    }
    async updatePatient({
        id,
        email,
        password,
        cpf,
        name,
        phoneNumber,
        role,
    }: UpdatePatientDto): Promise<Patient | null> {
        const patient = await this.prisma.patient.findUnique({
            where: {
                id,
            },
        });
        if (!patient) throw new BadRequestException('Paciente não encontrado');
        const result = await this.prisma.user.update({
            where: {
                id: patient.userId,
            },
            data: {
                email,
                password,
                cpf,
                name,
                phoneNumber,
                role,
            },
            include: {
                patients: true,
            },
        });
        return result;
    }
}
