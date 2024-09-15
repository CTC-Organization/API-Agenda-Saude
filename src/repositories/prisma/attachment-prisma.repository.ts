import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { AttachmentRepository } from '../attachment.repository';
import { CreateAttachmentDto } from '../../dto/create-attachment.dto';
import { Attachment, AttachmentType, Prisma } from '@prisma/postgres-client';
import { EnvConfigService } from '../../services/env-config.service';
import { randomUUID } from 'crypto';
import { CreateAttachmentsDto } from '../../dto/create-attachments.dto';
import { RequestPrismaRepository } from './request-prisma.repository';
import { Bucket, Storage } from '@google-cloud/storage';
import { UserPrismaRepository } from './user-prisma.repository';

@Injectable()
export class AttachmentPrismaRepository implements AttachmentRepository {
    private bucket: Bucket;

    constructor(
        private prisma: PrismaService,
        private envConfigService: EnvConfigService,
        @Inject(forwardRef(() => UserPrismaRepository))
        private userPrismaRepository: UserPrismaRepository,
        @Inject(forwardRef(() => RequestPrismaRepository))
        private requestPrismaRepository: RequestPrismaRepository,
    ) {
        const credentials = JSON.parse(this.envConfigService.getGoogleCloudCredentials());
        const storage = new Storage({
            credentials,
        });
        const bucketName = this.envConfigService.getGoggleCloudBucketName();
        this.bucket = storage.bucket(bucketName);
    }

    /*
     *   Pega file(arquivo) via interceptors em qualquer controller,
     *   AttachmentType é o type no ER de attachment. É o tipo de anexo por exemplo
     *   anexo de requisição (REQUEST_ATTACHMENT) ,
     *   (se vinherem posteriormente anexo de consulta, anexo de ficha de atendimento)
     *   referenceId é no momento sempre preenchido com requestId (possívelmente pode ser
     *   preenchido com AppointmentId- consulta/exame, ServiceTokenId- ficha de atendimento, etc)
     *   folder é uma string referente a pasta dentro do Bucket na Cloud storage que pode ser
     *   por exemplo a pasta request_attachments (futuramente appointment_attachments,
     *   service_token_attachments, etc)
     *   o método abaixo busca se existe uma request no banco para inserir um anexo na cloud
     *   e posteriormente registrar os dados do anexo no DB
     *   O blob se comunica com o bucket: tipo Storage.Bucket do google da cloud storage e faz a stream de escrita
     *   deixando ele publico ao realizar a Promise para a posição correta na pasta específica
     *   com um nome único gerado por UUID no storage.
     *   No fim o arquivo pode ser acessado publicamente pelo URL registrado no DB
     */
    async createAttachment({ file, referenceId, attachmentType, folder }: CreateAttachmentDto) {
        try {
            if (attachmentType === AttachmentType.REQUEST_ATTACHMENT) {
                if (!(await this.requestPrismaRepository.findRequestById(referenceId)))
                    throw new NotFoundException('RequisiçfindRequestByIdão não foi encontrada');
            }

            const fileName = `${randomUUID()}-${file.originalname}`;
            const blob = this.bucket.file(`${folder}/${fileName}}`);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: file.mimetype, // Defina o tipo de conteúdo
                },
            });
            const uploadPromise = new Promise<string>((resolve, reject) => {
                blobStream.on('finish', async () => {
                    await blob.makePublic();
                    const publicUrl = blob.publicUrl();
                    resolve(publicUrl);
                });
                blobStream.on('error', (err) => {
                    reject(err);
                });
            });
            blobStream.end(file.buffer);
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

    /*
     *   Semelhante a createAttachment, mas pega um array de arquivos por isso faz um
     *   loop async tendo que usar o Promise.all para garantir que todos os uploads no
     *   storage e os inserts no banco aconteçam. Lembrando que o upload e banco ainda
     *   não estão trabalhando atomicamente, se o upload for feito e o insert no db falhar
     *   não quer dizer que os uploads serão desfeitos - futura melhoria
     *
     */

    async createAttachments({ files, referenceId, attachmentType, folder }: CreateAttachmentsDto) {
        try {
            if (attachmentType === AttachmentType.REQUEST_ATTACHMENT) {
                if (!(await this.requestPrismaRepository.findRequestById(referenceId)))
                    throw new NotFoundException('Requisição não foi encontrada');
            }

            const uploadPromises = files.map(async (file) => {
                const fileName = `${randomUUID()}-${file.originalname}`;
                const blob = this.bucket.file(`${folder}/${fileName}`);
                const blobStream = blob.createWriteStream({
                    metadata: {
                        contentType: file.mimetype, // Defina o tipo de conteúdo
                    },
                });

                const uploadPromise = new Promise<string>((resolve, reject) => {
                    blobStream.on('finish', async () => {
                        try {
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
                    return { file, publicUrl, fileName };
                } catch (err) {
                    console.error('Error during file upload:', err);
                    throw err;
                }
            });

            const uploadedFiles = await Promise.all(uploadPromises);

            const attachmentCreatePromises = uploadedFiles.map(({ file, publicUrl, fileName }) => {
                return this.prisma.attachment.create({
                    data: {
                        id: randomUUID(),
                        type: attachmentType,
                        name: fileName,
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

    async deleteAttachments(attachmentIds: Array<string>): Promise<void> {
        try {
            const attachments = await this.prisma.attachment.findMany({
                where: {
                    id: {
                        in: attachmentIds,
                    },
                },
            });
            if (!attachments?.length) {
                throw new NotFoundException('Nenhum anexo encontrado');
            }

            const deleteFilePromises = attachments.map(async (attachment) => {
                const blob = this.bucket.file(`${attachment.folder}/${attachment.name}`);
                await blob.delete();
            });
            await Promise.all(deleteFilePromises);
            await this.prisma.attachment.deleteMany({
                where: {
                    id: {
                        in: attachmentIds,
                    },
                },
            });
        } catch (err) {
            console.error('Error deleting attachments:', err);
            throw err;
        }
    }

    async deleteAttachmentsByRequestId(requestId: string): Promise<void> {
        try {
            const attachments = await this.prisma.attachment.findMany({
                where: { requestId },
            });
            if (attachments?.length === 0) {
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
            await Promise.all(deleteFilePromises);
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
