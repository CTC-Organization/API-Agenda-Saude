import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserPrismaRepository } from './user-prisma.repository';
import { PrismaService } from '../services/prisma.service';
import { ServiceTokenRepository } from './service-token.repository';
import { CreateServiceTokenDto } from '@/dto/create-service-token.dto';
import { Prisma, ServiceStatus, ServiceToken } from '@prisma/client';
import { PatientPrismaRepository } from './patient-prisma.repository';
import { date } from 'zod';

@Injectable()
export class ServiceTokenPrismaRepository implements ServiceTokenRepository {
    constructor(
        private prisma: PrismaService,
        private patientRepository: PatientPrismaRepository,
    ) {}

    async completeServiceTokenOnRequestCreate(
        tx: Prisma.TransactionClient,
        patientId: string,
    ): Promise<any> {
        const result = await tx.serviceToken.findMany({
            where: {
                status: ServiceStatus.PENDING,
                patientId,
            },
            include: {
                requests: true,
            },
        });
        if (!result?.length)
            throw new NotFoundException('Nenhuma ficha de atendimento em andamento foi encontrada');

        return await tx.serviceToken.updateMany({
            where: {
                status: ServiceStatus.PENDING,
                patientId,
            },
            data: {
                status: ServiceStatus.COMPLETED,
            },
        });
    }
    async completeServiceToken(patientId: string): Promise<any> {
        const result = await this.prisma.serviceToken.findMany({
            where: {
                status: ServiceStatus.PENDING,
                patientId,
            },
            include: {
                requests: true,
            },
        });
        if (!result?.length)
            throw new NotFoundException('Nenhuma ficha de atendimento em andamento foi encontrada');

        return await this.prisma.serviceToken.updateMany({
            where: {
                status: ServiceStatus.PENDING,
                patientId,
            },
            data: {
                status: ServiceStatus.COMPLETED,
            },
        });
    }
    async cancelServiceToken(patientId: string): Promise<any> {
        const result = await this.prisma.serviceToken.findMany({
            where: {
                status: ServiceStatus.PENDING,
                patientId,
            },
            include: {
                requests: true,
            },
        });
        if (!result?.length)
            throw new NotFoundException('Nenhuma ficha de atendimento em andamento foi encontrada');

        return await this.prisma.serviceToken.updateMany({
            where: {
                status: ServiceStatus.PENDING,
                patientId,
            },
            data: {
                status: ServiceStatus.CANCELLED,
            },
        });
    }
    async createServiceToken({ patientId }: CreateServiceTokenDto) {
        try {
            const patient = await this.patientRepository.findPatientById(patientId);
            if (!patient) throw new BadRequestException('Paciente não encontrado');
            const result = await this.prisma.serviceToken.findMany({
                where: {
                    status: ServiceStatus.PENDING,
                    patientId: patient.id,
                },
                include: {
                    requests: true,
                },
            });
            if (result?.length) {
                if (result.find((r) => r.status === ServiceStatus.PENDING)) {
                    throw new BadRequestException('Há uma ficha pendente');
                }
            }
            return await this.prisma.serviceToken.create({
                data: {
                    patientId,
                    expirationDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24), // 1 dia para expiração
                },
            });
        } catch (err) {
            throw err;
        }
    }
    async findServiceTokenById(id: string): Promise<any> {
        const result = await this.prisma.serviceToken.findFirst({
            where: {
                id,
            },
            include: {
                requests: true,
            },
        });
        if (!result) throw new NotFoundException('Ficha de atendimento não encontrada');
        if (
            result.status === ServiceStatus.PENDING &&
            new Date(result.expirationDate) > new Date()
        ) {
            return await this.prisma.serviceToken.update({
                where: {
                    id: result.id,
                },
                data: {
                    status: ServiceStatus.EXPIRED,
                },
            });
        }
        return result;
    }
    async listServiceTokensByPatientId(patientId: string): Promise<any> {
        const result = await this.prisma.serviceToken.findMany({
            where: {
                patientId,
            },
            include: {
                requests: true,
            },
        });
        if (!result) throw new NotFoundException('Ficha de atendimento não encontrada');
        if (result?.length) {
            const now = new Date(); // se expirationDate = undefined então now === expirationDate e não filtra
            const filteredServiceTokensIds = result
                .filter(
                    (r) => r.status === ServiceStatus.PENDING && new Date(r.expirationDate) > now,
                )
                .map((x) => x.id);
            if (filteredServiceTokensIds?.length) {
                await this.prisma.serviceToken.updateMany({
                    where: {
                        id: {
                            in: filteredServiceTokensIds,
                        },
                    },
                    data: {
                        status: ServiceStatus.EXPIRED,
                    },
                });
            }
        }
        return result;
    }
}
