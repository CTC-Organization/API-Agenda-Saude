import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { UploadRepository } from '../upload.repository';
import { CreateUploadDto } from '../../dto/create-upload.dto';
import { Upload, UploadType, Prisma } from '@prisma/postgres-client';
import { EnvConfigService } from '../../services/env-config.service';
import { randomUUID } from 'crypto';
import { CreateUploadsDto } from '../../dto/create-uploads.dto';
import { Bucket, Storage } from '@google-cloud/storage';
import { UserPrismaRepository } from './user-prisma.repository';

@Injectable()
export class UploadPrismaRepository implements UploadRepository {
    private bucket: Bucket;

    constructor(
        private prisma: PrismaService,
        private envConfigService: EnvConfigService,
        @Inject(forwardRef(() => UserPrismaRepository))
        private userPrismaRepository: UserPrismaRepository,
    ) {
        const credentials = JSON.parse(this.envConfigService.getGoogleCloudCredentials());
        const storage = new Storage({
            credentials,
        });
        const bucketName = this.envConfigService.getGoggleCloudBucketName();
        this.bucket = storage.bucket(bucketName);
    }
    async createUpload({ file, referenceId, uploadType, folder }: CreateUploadDto) {
        try {
            if (uploadType === UploadType.AVATAR) {
                if (!(await this.userPrismaRepository.findUserById(referenceId)))
                    throw new NotFoundException('Usuário não foi encontrado');
            }
            const fileName = `${randomUUID()}-${file.originalname}`;
            const blob = this.bucket.file(`${folder}/${fileName}`);
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

            return await this.prisma.upload.create({
                data: {
                    type: uploadType,
                    name: fileName,
                    url: publicUrl,
                    userId: referenceId,
                    folder,
                },
            });
        } catch (err) {
            throw err;
        }
    }

    async createUploads({ files, referenceId, uploadType, folder }: CreateUploadsDto) {
        try {
            if (uploadType === UploadType.AVATAR) {
                if (!(await this.userPrismaRepository.findUserById(referenceId)))
                    throw new NotFoundException('Usuário não foi encontrado');
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

            const uploadCreatePromises = uploadedFiles.map(({ file, publicUrl, fileName }) => {
                return this.prisma.upload.create({
                    data: {
                        id: randomUUID(),
                        type: uploadType,
                        name: fileName,
                        url: publicUrl,
                        userId: referenceId,
                        folder,
                    },
                });
            });
            const uploads = await Promise.all(uploadCreatePromises);

            return uploads;
        } catch (err) {
            throw err;
        }
    }
    async findUploadById(id: string): Promise<Upload | null> {
        return this.prisma.upload.findUnique({
            where: { id },
        });
    }
    async findAllUploadsByUserId(referenceId: string): Promise<Upload[]> {
        return this.prisma.upload.findMany({
            where: { userId: referenceId },
        });
    }

    async deleteUploads(uploadIds: Array<string>): Promise<void> {
        try {
            const uploads = await this.prisma.upload.findMany({
                where: {
                    id: {
                        in: uploadIds,
                    },
                },
            });
            if (!uploads?.length) {
                throw new NotFoundException('Nenhum anexo encontrado');
            }

            const deleteFilePromises = uploads.map(async (upload) => {
                const blob = this.bucket.file(`${upload.folder}/${upload.name}`);
                await blob.delete();
            });
            await Promise.all(deleteFilePromises);
            await this.prisma.upload.deleteMany({
                where: {
                    id: {
                        in: uploadIds,
                    },
                },
            });
        } catch (err) {
            console.error('Error deleting uploads:', err);
            throw err;
        }
    }

    async deleteUploadsByUserId(userId: string): Promise<void> {
        try {
            const uploads = await this.prisma.upload.findMany({
                where: { userId },
            });
            if (uploads.length === 0) {
                throw new NotFoundException('Nenhum anexo encontrado');
            }
            if (uploads[0].type === UploadType.AVATAR) {
                const user = await this.userPrismaRepository.findUserById(userId);
                if (!user) {
                    throw new NotFoundException('Usuário não foi encontrada');
                }
            }

            const deleteFilePromises = uploads.map(async (upload) => {
                const blob = this.bucket.file(`${upload.folder}/${upload.name}`);
                await blob.delete();
            });
            await Promise.all(deleteFilePromises);
            await this.prisma.upload.deleteMany({
                where: { userId },
            });
        } catch (err) {
            console.error('Error deleting uploads:', err);
            throw err;
        }
    }
    async deleteUpload(uploadId: string): Promise<any> {
        try {
            const upload = await this.prisma.upload.findUnique({
                where: { id: uploadId },
            });

            if (!upload) {
                throw new NotFoundException('Upload not found');
            }

            const filePath = `${upload.folder}/${upload.name}`;

            await this.bucket.file(filePath).delete();

            return await this.prisma.upload.delete({
                where: { id: uploadId },
            });
        } catch (err) {
            throw err;
        }
    }
}
