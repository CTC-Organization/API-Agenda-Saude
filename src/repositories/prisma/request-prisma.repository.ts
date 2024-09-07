import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { RequestRepository } from '../request.repository';
import { CreateRequestDto } from '../../dto/create-request.dto';
import { AttachmentType, RequestStatus } from '@prisma/postgres-client';

import { ResendRequestDto } from '../../dto/resend-request.dto';
import { AttachmentPrismaRepository } from './attachment-prisma.repository';
import { ServiceTokenPrismaRepository } from './service-token-prisma.repository';
import { formatDateToBrazilian, isBeforeFiveBusinessDays } from '@/utils/dates';
import { CreateRequestWithoutServiceTokenDto } from '@/dto/create-request-without-service-token.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AcceptRequestDto } from '@/dto/accept-request.dto';

@Injectable()
export class RequestPrismaRepository implements RequestRepository {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => AttachmentPrismaRepository))
        private attachmentPrismaRepository: AttachmentPrismaRepository,
        private serviceTokenPrismaRepository: ServiceTokenPrismaRepository,
    ) {}

    async createRequestWithoutServiceToken(
        { patientId, specialty }: CreateRequestWithoutServiceTokenDto,
        files?: Array<Express.Multer.File>,
    ) {
        const date = new Date();
        date.setDate(date.getDate() + 2); // seria pelo lado admin do sus
        const serviceToken = await this.serviceTokenPrismaRepository.createServiceToken({
            patientId: patientId,
            expirationDate: date.toISOString(),
        });
        const request = await this.prisma.request.create({
            data: {
                specialty,
                patientId,
                serviceTokenId: serviceToken.id,
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

        // ficha de marcação de atendimento já utilizada
        await this.serviceTokenPrismaRepository.completeServiceTokenByPatientId(patientId);
        return request;
    }

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
    async listAllRequests(): Promise<any> {
        return await this.prisma.request.findMany({
            include: {
                patient: true,
                serviceToken: true,
                attachments: true,
            },
        });
    }
    async resendRequest(
        { patientId, requestId, specialty }: ResendRequestDto,
        files?: Array<Express.Multer.File>,
    ) {
        const request = await this.prisma.request.findFirst({
            where: { id: requestId },
            include: {
                attachments: true,
            },
        });
        if (request.status !== RequestStatus.DENIED) {
            throw new BadRequestException('A requisição não foi negada, não pode ser reenviada');
        }
        // só pode reenviar se foi negado
        // apagando anexos e requisição anterior antes de recriar uma requisição (reenvio)
        if (request.attachments?.length > 0) {
            await this.attachmentPrismaRepository.deleteAttachmentsByRequestId(requestId);
        }

        await this.prisma.request.delete({
            where: {
                id: requestId,
            },
        });
        const createRequestWithoutServiceTokenDto: CreateRequestWithoutServiceTokenDto = {
            patientId,
            specialty,
        };
        // recriando request
        return await this.createRequestWithoutServiceToken(
            createRequestWithoutServiceTokenDto,
            files,
        );
    }
    async completeRequest(requestId: string): Promise<any> {
        const result = await this.prisma.request.findUnique({
            where: {
                id: requestId,
            },
        });
        if (!result) throw new NotFoundException('Nenhuma requisição foi achada');
        if (result.status !== RequestStatus.CONFIRMED && result.status !== RequestStatus.PENDING) {
            throw new BadRequestException(`A requisição não está disponível para ser completa`);
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
            include: {
                attachments: true,
            },
        });
        if (!result)
            throw new NotFoundException('Nenhuma ficha de atendimento em andamento foi encontrada');
        const isAllowedToCancelBody = isBeforeFiveBusinessDays(new Date(result?.date));
        if (
            !isAllowedToCancelBody.isBeforeFiveBusinessDays &&
            (result.status === RequestStatus.CONFIRMED || result.status === RequestStatus.ACCEPTED)
        ) {
            throw new BadRequestException(
                `Não foi possível cancelar a requisição a menos de 5 dias úteis.
                Limite de cancelamento: ${formatDateToBrazilian(
                    isAllowedToCancelBody.dateFiveBusinessDaysAgo,
                )}`,
            );
        }
        if (result.status === RequestStatus.EXPIRED || result.status === RequestStatus.COMPLETED) {
            throw new BadRequestException(`A requisição não está disponível para cancelamento`);
        }

        if (result.attachments?.length > 0) {
            await this.attachmentPrismaRepository.deleteAttachmentsByRequestId(requestId);
        }

        return await this.prisma.request.delete({
            where: {
                id: requestId,
            },
        });
    }

    // Para aceitar uma requisição o admin/funcionário deve selecionar um posto de saúde
    // seleciona lat e long, o doutor de uma especialidade (criar lista fictícia no flutter)
    // e a data do exame/consulta
    // resumo: inserir lat, long, doctorName, date
    async acceptRequest(
        requestId: string,
        { date, doctorName, longitude, latitude }: AcceptRequestDto,
    ): Promise<any> {
        const result = await this.prisma.request.findUnique({
            where: {
                id: requestId,
            },
        });
        if (!result) throw new NotFoundException('Nenhuma requisição foi encontrada');
        if (result.status !== RequestStatus.PENDING && result.status !== RequestStatus.CONFIRMED) {
            throw new BadRequestException(`A requisição não está mais disponível`);
        }

        return await this.prisma.request.update({
            where: {
                id: requestId,
            },
            data: {
                date,
                doctorName,
                longitude,
                latitude,
                status: RequestStatus.ACCEPTED,
            },
        });
    }
    async denyRequest(requestId: string, observation: string): Promise<any> {
        const result = await this.prisma.request.findUnique({
            where: {
                id: requestId,
            },
        });
        if (!result) throw new NotFoundException('Nenhuma requisição foi encontrada');
        if (result.status !== RequestStatus.PENDING && result.status !== RequestStatus.CONFIRMED) {
            throw new BadRequestException(`A requisição não está disponível para negação`);
        }
        await this.prisma.request.update({
            where: {
                id: requestId,
            },
            data: {
                status: RequestStatus.DENIED,
                observation,
            },
        });
        return { observation };
    }
    async confirmRequest(requestId: string): Promise<any> {
        const result = await this.prisma.request.findUnique({
            where: {
                id: requestId,
            },
        });
        if (!result) throw new NotFoundException('Nenhuma requisição foi encontrada');
        if (result.status !== RequestStatus.ACCEPTED) {
            throw new BadRequestException(`A requisição não está disponível para confirmação`);
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
        if (
            (result.status === RequestStatus.PENDING ||
                result.status === RequestStatus.CONFIRMED) &&
            result?.date &&
            new Date(result?.date) < new Date()
        ) {
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
                .filter(
                    (r) =>
                        (r.status === RequestStatus.PENDING ||
                            r.status === RequestStatus.CONFIRMED) &&
                        r?.date &&
                        new Date(r?.date) < now,
                ) // expirationDate === agora então não filtra
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
