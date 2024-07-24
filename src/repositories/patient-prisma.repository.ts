import { BadRequestException, Injectable } from '@nestjs/common';
import { UserPrismaRepository } from './user-prisma.repository';
import { PrismaService } from '../services/prisma.service';
import { PatientRepository } from './patient.repository';
import { CreatePatient, Patient } from '../interfaces/patient';
import { UpdatePatientDto } from '../dto/update-patient.dto';
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
        result.id = result.patients[0].id;
        delete result.password;
        delete result.patients;
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
        result.id = result.patients[0].id;
        delete result.password;
        delete result.patients;
        return result;
    }
    async findPatientById(id: string): Promise<Patient | null> {
        const result = await this.prisma.patient.findFirst({
            where: {
                id,
            },
            include: {
                user: true,
            },
        });
        if (!result) throw new BadRequestException('Paciente não encontrado');

        delete result.user.password;
        delete result.user.id;
        return { id, ...result.user };
    }
    async updatePatient(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient | null> {
        const { email, password, name, phoneNumber, birthDate, susNumber } = updatePatientDto;
        return await this.prisma.$transaction(async (prisma) => {
            const patient = await prisma.patient.findUnique({
                where: {
                    id,
                },
            });
            if (!patient) throw new BadRequestException('Paciente não encontrado');
            const result = await prisma.user.update({
                where: {
                    id: patient.userId,
                },
                data: {
                    email,
                    password,
                    name,
                    phoneNumber,
                    birthDate,
                },
            });
            await prisma.patient.update({
                where: {
                    id,
                },
                data: {
                    susNumber,
                },
            });

            result.id = id;
            delete result.password;

            return { ...result, susNUmber: susNumber };
        });
    }
}
