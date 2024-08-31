import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { RequestRepository } from '../request.repository';
import { CreateRequestDto } from '../../dto/create-request.dto';
import { AttachmentType, RequestStatus } from '@prisma/postgres-client';

import { UpdateRequestDto } from '../../dto/update-request.dto';
import { AttachmentPrismaRepository } from './attachment-prisma.repository';
import { ServiceTokenPrismaRepository } from './service-token-prisma.repository';
import { formatDateToBrazilian, isBeforeFiveBusinessDays } from '@/utils/dates';

@Injectable()
export class RequestPrismaRepository implements RequestRepository {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => AttachmentPrismaRepository))
        private attachmentPrismaRepository: AttachmentPrismaRepository,
        private serviceTokenPrismaRepository: ServiceTokenPrismaRepository,
    ) {}

    async createRequest(
        { date, patientId, serviceTokenId }: CreateRequestDto,
        files?: Array<Express.Multer.File>,
    ) {
        const request = await this.prisma.request.create({
            data: {
                date,
                patientId,
                serviceTokenId,
                status: RequestStatus.PENDING,
            },
        });
        if (!!request && files?.length > 0) {
            await this.attachmentPrismaRepository.createAttachments({
                attachmentType: AttachmentType.REQUEST_ATTACHMENT,
                files,
                referenceId: request.id,
                folder: 'request_attachments',
            });
        }

        await this.serviceTokenPrismaRepository.completeServiceTokenByPatientId(patientId);
        return request;
    }
    async updateRequest({ date, requestId }: UpdateRequestDto) {
        const data: any = {};
        if (!!date) data.date = new Date(date);
        return await this.prisma.request.update({
            where: {
                id: requestId,
            },
            data,
        });
    }
    async completeRequest(requestId: string): Promise<any> {
        const result = await this.prisma.request.findUnique({
            where: {
                id: requestId,
            },
        });
        if (!result) throw new NotFoundException('Nenhuma requisição foi achada');
        if (result.status !== RequestStatus.CONFIRMED && result.status !== RequestStatus.PENDING) {
            throw new NotFoundException(`A requisição não está disponível para ser completa`);
        }

        return await this.prisma.request.update({
            where: {
                id: requestId,
            },
            data: {
                status: RequestStatus.COMPLETED,
            },
        });
    }
    async cancelRequest(requestId: string): Promise<any> {
        const result = await this.prisma.request.findUnique({
            where: {
                id: requestId,
            },
        });
        if (!result)
            throw new NotFoundException('Nenhuma ficha de atendimento em andamento foi encontrada');
        const isAllowedToCancelBody = isBeforeFiveBusinessDays(new Date(result.date));
        if (!isAllowedToCancelBody.isBeforeFiveBusinessDays) {
            throw new NotFoundException(
                `Não foi possível cancelar a requisição a menos de 5 dias úteis.
                Limite de cancelamento: ${formatDateToBrazilian(
                    isAllowedToCancelBody.dateFiveBusinessDaysAgo,
                )}`,
            );
        }
        if (result.status !== RequestStatus.CONFIRMED && result.status !== RequestStatus.PENDING) {
            throw new NotFoundException(`A requisição não está disponível para cancelamento`);
        }

        return await this.prisma.request.update({
            where: {
                id: requestId,
            },
            data: {
                status: RequestStatus.CANCELLED,
            },
        });
    }

    async acceptRequest(requestId: string): Promise<any> {
        const result = await this.prisma.request.findUnique({
            where: {
                id: requestId,
            },
        });
        if (!result) throw new NotFoundException('Nenhuma requisição foi encontrada');
        if (result.status !== RequestStatus.PENDING && result.status !== RequestStatus.CONFIRMED) {
            throw new NotFoundException(`A requisição não está mais disponível`);
        }

        return await this.prisma.request.update({
            where: {
                id: requestId,
            },
            data: {
                status: RequestStatus.ACCEPTED,
            },
        });
    }
    async denyRequest(requestId: string): Promise<any> {
        const result = await this.prisma.request.findUnique({
            where: {
                id: requestId,
            },
        });
        if (!result) throw new NotFoundException('Nenhuma requisição foi encontrada');
        if (result.status !== RequestStatus.PENDING && result.status !== RequestStatus.CONFIRMED) {
            throw new NotFoundException(`A requisição não está disponível para negação`);
        }

        return await this.prisma.request.update({
            where: {
                id: requestId,
            },
            data: {
                status: RequestStatus.DENIED,
            },
        });
    }
    async confirmRequest(requestId: string): Promise<any> {
        const result = await this.prisma.request.findUnique({
            where: {
                id: requestId,
            },
        });
        if (!result) throw new NotFoundException('Nenhuma requisição foi encontrada');
        if (result.status !== RequestStatus.PENDING && result.status !== RequestStatus.CONFIRMED) {
            throw new NotFoundException(`A requisição não está disponível para confirmação`);
        }
        return await this.prisma.request.update({
            where: {
                id: requestId,
            },
            data: {
                status: RequestStatus.CONFIRMED,
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
        if (!result) throw new NotFoundException('Ficha de atendimento não encontrada 4');
        if (result.status === RequestStatus.PENDING && new Date(result.date) < new Date()) {
            await this.prisma.request.update({
                where: {
                    id: result.id,
                },
                data: {
                    status: RequestStatus.EXPIRED,
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
        if (!result) throw new NotFoundException('Ficha de atendimento não encontrada 5');

        if (result?.length) {
            const now = new Date(); // agora'
            const filteredRequestsIds = result
                .filter((r) => r.status === RequestStatus.PENDING && new Date(r.date) < now) // expirationDate === agora então não filtra
                .map((x) => x.id);
            if (filteredRequestsIds?.length) {
                await this.prisma.request.updateMany({
                    where: {
                        id: {
                            in: filteredRequestsIds,
                        },
                    },
                    data: {
                        status: RequestStatus.EXPIRED,
                    },
                });
            }
        }
        return result;
    }
}
