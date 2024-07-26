import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { AttachmentRepository } from './attachment.repository';
import { CreateAttachmentDto } from '@/dto/create-attachment.dto';
import { Attachment, AttachmentType, Prisma } from '@prisma/client';
import { google } from 'googleapis';
import { EnvConfigService } from '@/services/env-config.service';
import { randomUUID } from 'crypto';
import { CreateAttachmentsDto } from '@/dto/create-attachments.dto';
import { RequestPrismaRepository } from './request-prisma.repository';

@Injectable()
export class AttachmentPrismaRepository implements AttachmentRepository {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => RequestPrismaRepository))
        private requestPrismaRepository: RequestPrismaRepository,

        private envConfigService: EnvConfigService,
    ) {}
    async createAttachment({ file, referenceId, attachmentType }: CreateAttachmentDto) {
        try {
            if (attachmentType === AttachmentType.REQUEST_ATTACHMENT)
                if (!(await this.requestPrismaRepository.findRequestById(referenceId)))
                    throw new NotFoundException('Requisição não foi encontrada');

            const auth = new google.auth.GoogleAuth({
                keyFile: this.envConfigService.getGoogleCredentialsJson(),
                scopes: ['https://www.googleapis.com/auth/drive'],
            });
            const drive = google.drive({ version: 'v3', auth });
            const fileMetadata = {
                name: `${file.originalname}-${randomUUID()}`,
                parents: [this.envConfigService.getGoogleDriveFolderId()],
            };
            const media = {
                mimeType: `${file.mimetype}`,
                body: file,
            };
            const response = await drive.files.create({
                media,
                fields: 'id',
                requestBody: fileMetadata,
            });

            const fileUrl = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
            return await this.prisma.attachment.create({
                data: {
                    type: attachmentType,
                    name: fileMetadata.name,
                    url: fileUrl,
                    requestId: referenceId,
                },
            });
        } catch (err) {
            throw err;
        }
    }

    async createAttachmentsOnRequestCreate(
        tx: Prisma.TransactionClient,
        { files, referenceId, attachmentType }: CreateAttachmentsDto,
    ) {
        try {
            if (attachmentType === AttachmentType.REQUEST_ATTACHMENT)
                if (!(await this.requestPrismaRepository.findRequestById(referenceId)))
                    throw new NotFoundException('Requisição não foi encontrada');
            const auth = new google.auth.GoogleAuth({
                keyFile: this.envConfigService.getGoogleCredentialsJson(),
                scopes: ['https://www.googleapis.com/auth/drive'],
            });
            const drive = google.drive({ version: 'v3', auth });

            const attachmentPromises = files.map(async (file) => {
                const fileMetadata = {
                    name: `${file.originalname}-${randomUUID()}`,
                    parents: [this.envConfigService.getGoogleDriveFolderId()],
                };
                const media = {
                    mimeType: `${file.mimetype}`,
                    body: file,
                };
                const response = await drive.files.create({
                    media,
                    fields: 'id',
                    requestBody: fileMetadata,
                });

                const fileUrl = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
                return tx.attachment.create({
                    data: {
                        type: attachmentType,
                        name: fileMetadata.name,
                        url: fileUrl,
                        requestId: referenceId,
                    },
                });
            });

            const attachments = await Promise.all(attachmentPromises);

            return attachments;
        } catch (err) {
            throw err;
        }
    }
    async createAttachments({ files, referenceId, attachmentType }: CreateAttachmentsDto) {
        try {
            if (attachmentType === AttachmentType.REQUEST_ATTACHMENT)
                if (!(await this.requestPrismaRepository.findRequestById(referenceId)))
                    throw new NotFoundException('Requisição não foi encontrada');
            const auth = new google.auth.GoogleAuth({
                keyFile: this.envConfigService.getGoogleCredentialsJson(),
                scopes: ['https://www.googleapis.com/auth/drive'],
            });
            const drive = google.drive({ version: 'v3', auth });

            const attachments = await this.prisma.$transaction(async (tx) => {
                const attachmentPromises = files.map(async (file) => {
                    const fileMetadata = {
                        name: `${file.originalname}-${randomUUID()}`,
                        parents: [this.envConfigService.getGoogleDriveFolderId()],
                    };
                    const media = {
                        mimeType: `${file.mimetype}`,
                        body: file,
                    };
                    const response = await drive.files.create({
                        media,
                        fields: 'id',
                        requestBody: fileMetadata,
                    });

                    const fileUrl = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
                    return tx.attachment.create({
                        data: {
                            type: attachmentType,
                            name: fileMetadata.name,
                            url: fileUrl,
                            requestId: referenceId,
                        },
                    });
                });

                return Promise.all(attachmentPromises);
            });

            return attachments;
        } catch (err) {
            throw err;
        }
    }
    async findAttachmentById(id: string): Promise<Attachment | null> {
        return this.prisma.attachment.findUnique({
            where: { id },
        });
    }
    async findAllAttachmentsByRequestId(referenceId: string): Promise<Attachment[]> {
        return this.prisma.attachment.findMany({
            where: { requestId: referenceId },
        });
    }

    async deleteAttachment(attachmentId: string): Promise<void> {
        try {
            const attachment = await this.prisma.attachment.findUnique({
                where: { id: attachmentId },
            });

            if (!attachment) {
                throw new NotFoundException('Attachment not found');
            }

            const auth = new google.auth.GoogleAuth({
                keyFile: this.envConfigService.getGoogleCredentialsJson(),
                scopes: ['https://www.googleapis.com/auth/drive'],
            });
            const drive = google.drive({ version: 'v3', auth });
            const fileId = attachment.url.split('id=')[1];
            await drive.files.delete({
                fileId: fileId,
            });

            await this.prisma.attachment.delete({
                where: { id: attachmentId },
            });
        } catch (err) {
            throw err;
        }
    }
}
