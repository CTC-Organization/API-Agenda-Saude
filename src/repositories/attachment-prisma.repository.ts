import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserPrismaRepository } from './user-prisma.repository';
import { PrismaService } from '../services/prisma.service';
import { AttachmentRepository } from './attachment.repository';
import { CreateAttachmentDto } from '@/dto/create-attachment.dto';
import { ServiceStatus, Attachment } from '@prisma/client';
import { PatientPrismaRepository } from './patient-prisma.repository';
import { google } from 'googleapis';
import { EnvConfigService } from '@/services/env-config.service';
import { randomUUID } from 'crypto';
import * as fs from 'fs';

@Injectable()
export class AttachmentPrismaRepository implements AttachmentRepository {
    constructor(
        private prisma: PrismaService,
        private patientRepository: PatientPrismaRepository,
        private envConfigService: EnvConfigService,
    ) {}
    async createAttachment(file: Express.Multer.File, patientId: CreateAttachmentDto) {
        try {
            const auth = new google.auth.GoogleAuth({
                keyFile: this.envConfigService.getGoogleCredentialsJson(),
                scopes: ['https://www.googleapis.com/auth/drive'],
            });
            const drive = google.drive({ version: 'v3', auth });
            const fileMetadata = {
                name: `${file.originalName}-${randomUUID()}`,
                parents: [this.envConfigService.getGoogleDriveFolderId()],
            };
            const media = {
                mimeType: `${file.mimeType}`,
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
                    requestId: patientId.patientId,
                    url: fileUrl,
                },
            });
        } catch (err) {
            throw err;
        }
    }
    async findAttachmentById(id: string): Promise<any> {
        const result = await this.prisma.attachment.findFirst({
            where: {
                id,
            },
        });
        return result;
    }
}
