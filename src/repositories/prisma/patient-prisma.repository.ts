import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UserPrismaRepository } from './user-prisma.repository';
import { PrismaService } from '../../services/prisma.service';
import { PatientRepository } from '../patient.repository';
import { CreatePatient, Patient } from '../../interfaces/patient';
import { UpdatePatientDto } from '../../dto/update-patient.dto';
import { UserRole } from '@prisma/postgres-client';
import { UploadService } from '@/services/upload.service';
import { UploadType } from '@prisma/postgres-client';
import * as argon2 from 'argon2';

@Injectable()
export class PatientPrismaRepository extends UserPrismaRepository implements PatientRepository {
    constructor(
        public prisma: PrismaService,

        @Inject(forwardRef(() => UploadService))
        public uploadService: UploadService,
    ) {
        super(prisma);
    }

    async createPatient({
        email,
        password,
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

    async findPatientBySusNumber(susNumber: string): Promise<any> {
        const result = await this.prisma.patient.findFirst({
            where: {
                susNumber,
            },
            include: {
                user: true,
            },
        });

        if (!!result) {
            delete result.user.password;
        }
        return result;
    }

    // async findPatientByCpf(cpf: string): Promise<Patient | null> {
    //     const result = await this.prisma.user.findFirst({
    //         where: {
    //             cpf,
    //         },
    //         include: {
    //             patients: true,
    //         },
    //     });
    //     if (result?.patients) {
    //         result.id = result.patients[0].id;
    //         delete result.patients;
    //     }
    //     if (!!result) {
    //         delete result.password;
    //     }
    //     return result;
    // }
    async findPatientById(id: string): Promise<any> {
        const result = await this.prisma.patient.findFirst({
            where: {
                id,
            },
            include: {
                user: true,
            },
        });
        const userId = result.userId;
        if (!!result?.user) {
            delete result.user.password;
            delete result.user.id;
        }
        return { id, ...result.user, userId };
    }
    async updatePatient(
        id: string,
        updatePatientDto: UpdatePatientDto,
        file?: Express.Multer.File,
    ): Promise<Patient | null> {
        const {
            email,
            password,
            name,
            phoneNumber,
            birthDate,
            susNumber,
            avatar,
            confirmPassword,
        } = updatePatientDto;

        const userData: any = {
            email,
            password,
            name,
            phoneNumber,
        };
        try {
            const patientQuery = await this.prisma.patient.findFirst({
                where: {
                    id,
                },
                include: {
                    user: true,
                },
            });
            const userId = patientQuery.userId;
            const oldPassword = patientQuery.user.password;
            if (!!patientQuery?.user) {
                delete patientQuery.user.password;
                delete patientQuery.user.id;
            }
            const patient = { id, ...patientQuery.user, userId };

            if (!patient) throw new BadRequestException('Paciente não encontrado');

            if (updatePatientDto?.password) {
                if (updatePatientDto?.confirmPassword) {
                    const isMatch = await argon2.verify(oldPassword, confirmPassword);
                    if (!isMatch) throw new BadRequestException('Senha de confirmação inválida');
                    // se passar por isso a senha será atualizada logo abaixo
                } else {
                    throw new BadRequestException('Confirmação de senha não preenchida');
                }
            } else {
                throw new BadRequestException('Senha de confirmação inválida');
            }

            if (!!avatar) {
                const deletedAvatar = await this.uploadService.deleteUpload(avatar);
                if (!!deletedAvatar) {
                    await this.prisma.user.update({
                        where: {
                            id: patient.userId,
                        },
                        data: {
                            avatar: null,
                        },
                    });
                }
            }

            if (!!file && !!patient) {
                try {
                    const upload = await this.uploadService.createUpload({
                        file: file,
                        folder: 'avatars',
                        uploadType: UploadType.AVATAR,
                        referenceId: patient.userId,
                    });
                    if (!!upload) {
                        await this.prisma.user.update({
                            where: {
                                id: patient.userId,
                            },
                            data: {
                                avatar: upload.id,
                            },
                        });
                    }
                } catch (err) {
                    throw new Error('erro 2: ' + err);
                }
            }

            if (!!birthDate) {
                userData.birthDate = new Date(birthDate);
            }
            return await this.prisma.$transaction(async (prisma) => {
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
        } catch (err) {
            throw new Error('erro 1: ' + err);
        }
    }
}
