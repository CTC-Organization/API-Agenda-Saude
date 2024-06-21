import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as AWS from 'aws-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { UploadSituation, UploadType } from '@prisma/client';
import { EnvConfigService } from '../shared/infra/env-config/env-config.service';

@Injectable()
export class UploadService {
    constructor(
        private readonly configService: EnvConfigService,
        private readonly prismaService: PrismaService,
    ) {}

    private readonly s3Client = new AWS.S3({
        endpoint: this.configService.getAwsEndpoint(),
        region: this.configService.getAwsS3Region(),
        accessKeyId: this.configService.getAwsAccessKeyId(),
        secretAccessKey: this.configService.getAwsSecretAccessKey(),
    });

    async uploadFile(
        file: Express.Multer.File,
        folder: string,
        name?: string,
        type?: UploadType,
        situation?: UploadSituation,
    ) {
        try {
            const uuid = randomUUID();
            const extension = file.mimetype.substring(file.mimetype.lastIndexOf('/') + 1);
            const result = await this.s3Client
                .upload({
                    Bucket: `${this.configService.getAwsBucket()}/${folder}`,
                    Key: `${uuid}.${extension}`,
                    Body: file.buffer,
                    ACL: 'public-read',
                })
                .promise();

            return await this.prismaService.upload.create({
                data: {
                    id: `${uuid}`,
                    storage_id: `${uuid}.${extension}`,
                    name: name ?? null,
                    situation: situation,
                    url: result.Location,
                    type: type ?? null,
                    size: `${file.buffer.byteLength / 1000}`,
                    extension,
                },
            });
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async uploadFiles(
        files: Array<Express.Multer.File>,
        folder: string,
        names?: string[],
        types?: UploadType[],
        situation?: UploadSituation[],
    ) {
        try {
            const medias = [];

            for (const item in files) {
                const uuid = randomUUID();
                const extension = files[item].mimetype.substring(files[item].mimetype.length - 3);

                const result = await this.s3Client
                    .upload({
                        Bucket: `${this.configService.getAwsBucket()}/${folder}`,
                        Key: `${uuid}.${extension}`,
                        Body: files[item].buffer,
                        ACL: 'public-read',
                    })
                    .promise();

                const data = {
                    id: `${uuid}`,
                    storage_id: `${uuid}.${extension}`,
                    name: names[item] ?? null,
                    url: result.Location,
                    situation: situation[item] ?? null,
                    type: types[item] ?? null,
                    size: `${files[item].buffer.byteLength / 1000}`,
                    extension,
                };

                await this.prismaService.upload.create({
                    data,
                });

                medias.push(data);
            }
            return medias;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async uploadFilesAttachedByEmail(files: Array<Express.Multer.File>, folder: string) {
        try {
            const medias = [];

            for (const item in files) {
                const uuid = randomUUID();
                const extension = files[item].mimetype.substring(files[item].mimetype.length - 3);

                const result = await this.s3Client
                    .upload({
                        Bucket: `${this.configService.getAwsBucket()}/${folder}`,
                        Key: `${uuid}.${extension}`,
                        Body: files[item].buffer,
                        ACL: 'public-read',
                    })
                    .promise();

                const data = {
                    id: `${uuid}`,
                    storage_id: `${uuid}.${extension}`,
                    name: `${files[item].originalname}`,
                    url: result.Location,
                    size: `${files[item].buffer.byteLength / 1000}`,
                    extension,
                };

                medias.push(data);
            }
            return medias;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async getFileByUrl(url: string) {
        const file = await this.prismaService.upload.findFirst({
            where: {
                url,
            },
        });

        if (!file) throw new BadRequestException('O arquivo procurado não existe!');
        return file;
    }

    async getAllFiles() {
        try {
            const files = await this.s3Client
                .listObjectsV2({
                    Bucket: `${this.configService.getAwsBucket()}`,
                })
                .promise();

            return files.Contents.map((item) => {
                const [folder, id] = item.Key.split('/');
                return { id, folder };
            });
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async deleteFile(file: string, folder: string) {
        const uploadId = file.split('.')[0];

        const hasUpload = await this.prismaService.upload.findFirst({
            where: {
                id: uploadId,
            },
        });

        try {
            if (hasUpload) {
                await this.prismaService.upload.delete({
                    where: {
                        id: uploadId,
                    },
                });
            }

            await this.s3Client
                .deleteObject({
                    Bucket: `${this.configService.getAwsBucket()}/${folder}`,
                    Key: file,
                })
                .promise();

            return { message: 'Arquivo deletado com sucesso!' };
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
