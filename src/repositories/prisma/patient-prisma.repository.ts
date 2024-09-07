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
        const { email, password, name, phoneNumber, birthDate, susNumber, avatar } =
            updatePatientDto;
        if (!!avatar) {
            try {
                await this.uploadService.deleteUpload(avatar);
            } catch (err) {
                throw new Error('erro 1: ' + err);
            }
        }
        const patient = await this.findPatientById(id);
        let upload: any;

        if (!!file && !!patient) {
            console.log(file);
            try {
                upload = await this.uploadService.createUpload({
                    file: file,
                    folder: 'avatars',
                    uploadType: UploadType.AVATAR,
                    referenceId: patient.userId,
                });
            } catch (err) {
                throw new Error('erro 2: ' + err);
            }
        }
        const userData: any = {
            avatar: upload?.id,
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
