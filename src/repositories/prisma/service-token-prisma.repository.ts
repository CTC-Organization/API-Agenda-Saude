import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { ServiceTokenRepository } from '../service-token.repository';
import { CreateServiceTokenDto } from '../../dto/create-service-token.dto';
import { ServiceStatus } from '@prisma/postgres-client';
import { PatientPrismaRepository } from './patient-prisma.repository';
import { formatDateToBrazilian, isBeforeFiveBusinessDays } from '@/utils/dates';

@Injectable()
export class ServiceTokenPrismaRepository implements ServiceTokenRepository {
    constructor(
        private prisma: PrismaService,
        private patientRepository: PatientPrismaRepository,
    ) {}
    async completeServiceTokenByPatientId(patientId: string): Promise<any> {
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
    async cancelServiceTokenByPatientId(patientId: string): Promise<any> {
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

        return await this.prisma.serviceToken.update({
            where: {
                id: result[0].id,
            },
            data: {
                status: ServiceStatus.CANCELLED,
            },
        });
    }
    async createServiceToken({ patientId, expirationDate }: CreateServiceTokenDto) {
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
                    expirationDate,
                },
            });
        } catch (err) {
            throw err;
        }
    }

    async findValidServiceTokenByPatientId(id: string): Promise<any> {
        const result = await this.prisma.serviceToken.findFirst({
            where: {
                patientId: id,
                status: ServiceStatus.PENDING,
            },
            include: {
                requests: true,
            },
        });
        if (!result) throw new NotFoundException('Ficha de atendimento não encontrada');
        if (
            result.status === ServiceStatus.PENDING &&
            new Date(result.expirationDate) < new Date()
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
            new Date(result.expirationDate) < new Date()
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
            const now = new Date();
            const filteredServiceTokensIds = result
                .filter(
                    (r) => r.status === ServiceStatus.PENDING && new Date(r.expirationDate) < now, // se expirationDate = undefined então now === expirationDate e não filtra
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
