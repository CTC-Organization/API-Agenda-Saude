import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { AttachmentRepository } from './attachment.repository';
import { CreateAttachmentDto } from '../dto/create-attachment.dto';
import { Attachment, AttachmentType, Prisma } from '@prisma/client';
import { EnvConfigService } from '../services/env-config.service';
import { randomUUID } from 'crypto';
import { CreateAttachmentsDto } from '../dto/create-attachments.dto';
import { RequestPrismaRepository } from './request-prisma.repository';
import { Bucket, Storage } from '@google-cloud/storage';

@Injectable()
export class AttachmentPrismaRepository implements AttachmentRepository {
    private bucket: Bucket;

    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => RequestPrismaRepository))
        private requestPrismaRepository: RequestPrismaRepository,

        private envConfigService: EnvConfigService,
    ) {
        const credentials = JSON.parse(this.envConfigService.getGoogleCloudCredentials());
        const storage = new Storage({
            credentials,
        });
        const bucketName = this.envConfigService.getGoggleCloudBucketName();
        this.bucket = storage.bucket(bucketName);
    }
    
    async createAttachment({ file, referenceId, attachmentType, folder }: CreateAttachmentDto) {
        try {
            if (attachmentType === AttachmentType.REQUEST_ATTACHMENT)
                if (!(await this.requestPrismaRepository.findRequestById(referenceId)))
                    throw new NotFoundException('RequisiçfindRequestByIdão não foi encontrada');
            const fileName = `${file.originalname}-${randomUUID()}`;
            const blob = this.bucket.file(`${folder}/${fileName}}`);
            const blobStream = blob.createWriteStream();
            const uploadPromise = new Promise<string>((resolve, reject) => {
                blobStream.on('finish', async () => {
                    // Define as permissões para o arquivo ser publicamente acessível
                    await blob.makePublic();
                    const publicUrl = blob.publicUrl(); // publicUrl será retornado para inserir no DB
                    resolve(publicUrl); // A stream se completou
                });
                blobStream.on('error', (err) => {
                    reject(err); // A stream falhou 
                });
            });
            blobStream.end(file.buffer); //
            const publicUrl = await uploadPromise;

            return await this.prisma.attachment.create({
                data: {
                    type: attachmentType,
                    name: fileName,
                    url: publicUrl,
                    requestId: referenceId,
                    folder,
                },
            });
        } catch (err) {
            throw err;
        }
    }

    async createAttachments({ files, referenceId, attachmentType, folder }: CreateAttachmentsDto) {
        try {
            if (attachmentType === AttachmentType.REQUEST_ATTACHMENT)
                if (!(await this.requestPrismaRepository.findRequestById(referenceId)))
                    throw new NotFoundException('Requisição não foi encontrada');
            const uploadPromises = files.map(async (file) => {
                const fileName = `${file.originalname}-${randomUUID()}`;
                const blob = this.bucket.file(`${folder}/${fileName}`);
                const blobStream = blob.createWriteStream();

                const uploadPromise = new Promise<string>((resolve, reject) => {
                    blobStream.on('finish', async () => {
                        try {
                            // Define as permissões para o arquivo ser publicamente acessível
                            await blob.makePublic();
                            const publicUrl = blob.publicUrl();
                            resolve(publicUrl);
                        } catch (err) {
                            reject(err);
                        }
                    });

                    blobStream.on('error', (err) => {
                        reject(err);
                    });
                });

                blobStream.end(file.buffer);

                try {
                    const publicUrl = await uploadPromise;
                    return { file, publicUrl };
                } catch (err) {
                    console.error('Error during file upload:', err);
                    throw err;
                }
            });

            const uploadedFiles = await Promise.all(uploadPromises);

            const attachmentCreatePromises = uploadedFiles.map(({ file, publicUrl }) => {
                return this.prisma.attachment.create({
                    data: {
                        id: randomUUID(),
                        type: attachmentType,
                        name: file.originalname,
                        url: publicUrl,
                        requestId: referenceId,
                        folder,
                    },
                });
            });
            const attachments = await Promise.all(attachmentCreatePromises);

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

    async deleteAttachmentsByRequestId(requestId: string): Promise<void> {
        try {
            const attachments = await this.prisma.attachment.findMany({
                where: { requestId },
            });
            if (attachments.length === 0) {
                throw new NotFoundException('Nenhum anexo encontrado');
            }
            if (attachments[0].type === AttachmentType.REQUEST_ATTACHMENT) {
                const request = await this.requestPrismaRepository.findRequestById(requestId);
                if (!request) {
                    throw new NotFoundException('Requisição não foi encontrada');
                }
            }

            const deleteFilePromises = attachments.map(async (attachment) => {
                const blob = this.bucket.file(`${attachment.folder}/${attachment.name}`);
                await blob.delete();
            });

            // Aguarda a conclusão de todas as deleções dos arquivos
            await Promise.all(deleteFilePromises);

            // Deletar os anexos do banco de dados
            await this.prisma.attachment.deleteMany({
                where: { requestId },
            });
        } catch (err) {
            console.error('Error deleting attachments:', err);
            throw err;
        }
    }
    async deleteAttachment(attachmentId: string): Promise<void> {
        try {
            const attachment = await this.prisma.attachment.findUnique({
                where: { id: attachmentId },
            });

            if (!attachment) {
                throw new NotFoundException('Attachment not found');
            }
            const blob = this.bucket.file(`${attachment.folder}/${attachment.name}`);

            await blob.delete();

            await this.prisma.attachment.delete({
                where: { id: attachmentId },
            });
        } catch (err) {
            throw err;
        }
    }
}
