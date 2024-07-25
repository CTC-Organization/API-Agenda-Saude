import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as AWS from 'aws-sdk';
import { PrismaService } from './prisma.service';
import { EnvConfigService } from './env-config.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
    constructor(
        private readonly configService: EnvConfigService,
        private readonly prismaService: PrismaService,
    ) { }

    private readonly s3Client = new AWS.S3({
        endpoint: this.configService.getAwsEndpoint(),
        region: this.configService.getAwsS3Region(),
        accessKeyId: this.configService.getAwsAccessKeyId(),
        secretAccessKey: this.configService.getAwsSecretAccessKey(),
    });

    async uploadFile(
        file: Express.Multer.File,
        requestId: string,
        description?: string,
    ) {
        try {
            const uuid = randomUUID();
            const extension = file.mimetype.substring(file.mimetype.lastIndexOf('/') + 1);
            const result = await this.s3Client
                .upload({
                    Bucket: `${this.configService.getAwsBucket()}/agenda-saude`,
                    Key: `${uuid}.${extension}`,
                    Body: file.buffer,
                    ACL: 'public-read',
                })
                .promise();

            return await this.prismaService.attachment.create({
                data: {
                    id: `${uuid}`,
                    url: result.Location,
                    description: description,
                    requestId: requestId,
                    size: file.size,
                },
            });
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async uploadFiles(
        files: Array<Express.Multer.File>,
        requestId: string,
        

    ) {
        try {
            const medias = [];

            for (const item of files) {
                const uuid = randomUUID();
                const extension = item.mimetype.substring(item.mimetype.length - 3);

                const result = await this.s3Client
                    .upload({
                        Bucket: `${this.configService.getAwsBucket()}/agenda-saude`,
                        Key: `${uuid}.${extension}`,
                        Body: item.buffer,
                        ACL: 'public-read',
                    })
                    .promise();

                const data = {
                    id: `${uuid}`,
                    url: result.Location,
                    requestId: requestId,
                    size: item.size,
                    extension,
                };


                await this.prismaService.attachment.create({
                    data
                });

                medias.push(data);
            }
            return medias;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }


    async getFileByUrl(url: string) {
        const file = await this.prismaService.attachment.findFirst({
            where: {
                url,
            },
        });

        if (!file) throw new BadRequestException('O arquivo procurado não existe!');
        return file;
    }

    async getFileById(id: string) {
        const file = await this.prismaService.attachment.findFirst({
            where: {
                id,
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

        const hasUpload = await this.prismaService.attachment.findFirst({
            where: {
                id: uploadId,
            },
        });

        try {
            if (hasUpload) {
                await this.prismaService.attachment.delete({
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
