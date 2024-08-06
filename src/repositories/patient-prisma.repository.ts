import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
        birthDate,
        susNumber,
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
                    birthDate: new Date(birthDate),
                },
            });
            const newPatient = await prisma.patient.create({
                data: {
                    userId: newUser.id,
                    susNumber,
                },
            });
            return {
                id: newPatient.id,
                cpf: newUser.cpf,
                email: newUser.email || '',
                name: newUser.name || '',
                phoneNumber: newUser.phoneNumber || '',
                role: newUser.role || UserRole.PATIENT,
                susNumber: newPatient.susNumber,
                birthDate: new Date(newUser.birthDate),
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
        if (result?.patients) {
            result.id = result.patients[0].id;
            delete result.patients;
        }
        if (!!result) {
            delete result.password;
        }
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
        if (result?.patients) {
            result.id = result.patients[0].id;
            delete result.patients;
        }
        if (!!result) {
            delete result.password;
        }
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
        if (!!result?.user) {
            delete result.user.password;
            delete result.user.id;
        }
        return { id, ...result.user };
    }
    async updatePatient(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient | null> {
        const { email, password, name, phoneNumber, birthDate, susNumber } = updatePatientDto;

        const userData: any = {
            email,
            password,
            name,
            phoneNumber,
        };

        if (!!birthDate) {
            userData.birthDate = new Date(birthDate);
        }
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
                data: userData,
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
