import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UserPrismaRepository } from './user-prisma.repository';
import { PrismaService } from '../services/prisma.service';
import { RequestRepository } from './request.repository';
import { CreateRequestDto } from '../dto/create-request.dto';
import { ServiceStatus, Request, AttachmentType, RequestStatus } from '@prisma/client';
import { PatientPrismaRepository } from './patient-prisma.repository';
import { date } from 'zod';
import { UpdateRequestDto } from '../dto/update-request.dto';
import { AttachmentPrismaRepository } from './attachment-prisma.repository';
import { ServiceTokenPrismaRepository } from './service-token-prisma.repository';

@Injectable()
export class RequestPrismaRepository implements RequestRepository {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => AttachmentPrismaRepository))
        private attachmentPrismaRepository: AttachmentPrismaRepository,
        private serviceTokenPrismaRepository: ServiceTokenPrismaRepository,
    ) {}
    async createRequest(
        files: Array<Express.Multer.File>,
        { date, patientId, serviceTokenId }: CreateRequestDto,
    ) {
        const request = await this.prisma.request.create({
            data: {
                date,
                patientId,
                serviceTokenId,
                status: RequestStatus.PENDING,
            },
        });
        if (!!request) {
            console.log('criou request');
            await this.attachmentPrismaRepository.createAttachments({
                attachmentType: AttachmentType.REQUEST_ATTACHMENT,
                files,
                referenceId: request.id,
                folder: 'request_attachments',
            });
        }
        await this.serviceTokenPrismaRepository.completeServiceToken(patientId);;
        return request;
    }
    async updateRequest({ date, requestId }: UpdateRequestDto) {
        return await this.prisma.request.update({
            where: {
                id: requestId,
            },
            data: {
                date,
            },
        });
    }
    async completeRequest(patientId: string): Promise<any> {
        const result = await this.prisma.request.findMany({
            where: {
                status: RequestStatus.PENDING,
                patientId,
            },
            include: {
                serviceToken: true,
            },
        });
        if (!result?.length) throw new NotFoundException('Nenhuma requisição foi achada');

        return await this.prisma.request.updateMany({
            where: {
                status: RequestStatus.PENDING,
                patientId,
            },
            data: {
                status: RequestStatus.COMPLETED,
            },
        });
    }
    async cancelRequest(patientId: string): Promise<any> {
        const result = await this.prisma.request.findMany({
            where: {
                status: RequestStatus.PENDING,
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
                status: RequestStatus.PENDING,
                patientId,
            },
            data: {
                status: RequestStatus.CANCELLED,
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
            const now = new Date(); // se expirationDate = undefined então now === expirationDate e não filtra
            const filteredRequestsIds = result
                .filter((r) => r.status === RequestStatus.PENDING && new Date(r.date) < now)
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
