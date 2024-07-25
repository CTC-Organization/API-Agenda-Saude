import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserPrismaRepository } from './user-prisma.repository';
import { PrismaService } from '../services/prisma.service';
import { RequestRepository } from './request.repository';
import { CreateRequestDto } from '@/dto/create-request.dto';
import { ServiceStatus, Request } from '@prisma/client';
import { PatientPrismaRepository } from './patient-prisma.repository';
import { date } from 'zod';
import { UpdateRequestDto } from '@/dto/update-request.dto';

@Injectable()
export class RequestPrismaRepository implements RequestRepository {
    constructor(
        private prisma: PrismaService,
        private patientRepository: PatientPrismaRepository,
    ) {}
    async createRequest({ patientId }: CreateRequestDto) {
    }
    async updateRequest({ patientId }: UpdateRequestDto) {
    }
    async completeRequest(patientId: string): Promise<any> {
        const result = await this.prisma.request.findMany({
            where: {
                status: ServiceStatus.PENDING,
                patientId,
            },
            include: {
                serviceToken: true,
            },
        });
        if (!result?.length)
            throw new NotFoundException('Nenhuma requisição foi achada');

        return await this.prisma.request.updateMany({
            where: {
                status: ServiceStatus.PENDING,
                patientId,
            },
            data: {
                status: ServiceStatus.COMPLETED,
            },
        });
    }
    async cancelRequest(patientId: string): Promise<any> {
        const result = await this.prisma.request.findMany({
            where: {
                status: ServiceStatus.PENDING,
                patientId,
            },
            include: {
                serviceToken: true,
            },
        });
        if (!result?.length)
            throw new NotFoundException('Nenhuma ficha de atendimento em andamento foi encontrada');

        return await this.prisma.request.updateMany({
            where: {
                status: ServiceStatus.PENDING,
                patientId,
            },
            data: {
                status: ServiceStatus.CANCELLED,
            },
        });
    }

    async findRequestById(id: string): Promise<any> {
        const result = await this.prisma.request.findFirst({
            where: {
                id,
            },
            include: {
                serviceToken: true,
                attachments: true,
            },
        });
        if (!result) throw new NotFoundException('Ficha de atendimento não encontrada');
        if (
            result.status === ServiceStatus.PENDING &&
            new Date(result.date) > new Date()
        ) {
            await this.prisma.request.update({
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
    async listRequestsByPatientId(patientId: string): Promise<any> {
        const result = await this.prisma.request.findMany({
            where: {
                patientId,
            },
            include: {
                serviceToken: true,
                attachments: true,
            },
        });
        if (!result) throw new NotFoundException('Ficha de atendimento não encontrada');
        if (result?.length) {
            const now = new Date(); // se expirationDate = undefined então now === expirationDate e não filtra
            const filteredRequestsIds = result
                .filter(
                    (r) => r.status === ServiceStatus.PENDING && new Date(r.date) > now,
                )
                .map((x) => x.id);
            if (filteredRequestsIds?.length) {
                await this.prisma.request.updateMany({
                    where: {
                        id: {
                            in: filteredRequestsIds,
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
