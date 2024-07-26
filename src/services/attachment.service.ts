import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttachmentDto } from '@/dto/create-attachment.dto';
import { AttachmentRepository } from '@/repositories/attachment.repository';
import { z } from 'zod';
import { AttachmentType } from '@prisma/client';
import { Storage } from '@google-cloud/storage';
import { RequestRepository } from '@/repositories/request.repository';

@Injectable()
export class AttachmentService {
    constructor(private attachmentRepository: AttachmentRepository) {}

    async createAttachment({
        file,
        attachmentType,
        referenceId,
        folder,
    }: {
        file: Express.Multer.File;
        attachmentType: AttachmentType;
        referenceId: string;
        folder: string;
    }) {
        try {
            return await this.attachmentRepository.createAttachment({
                file,
                attachmentType,
                referenceId,
                folder,
            });
        } catch (err) {
            throw err;
        }
    }
    async createAttachments({
        files,
        attachmentType,
        referenceId,
        folder,
    }: {
        files: Array<Express.Multer.File>;
        attachmentType: AttachmentType;
        referenceId: string;
        folder: string;
    }) {
        const result = await this.attachmentRepository.createAttachments({
            files,
            attachmentType,
            referenceId,
            folder,
        });
        return result;
    }
    async findAllAttachmentsByRequestId(referenceId: string) {
        const result = await this.attachmentRepository.findAllAttachmentsByRequestId(referenceId);
        return result;
    }
    async deleteAttachment(attachmentId: string) {
        const result = await this.attachmentRepository.deleteAttachment(attachmentId);
        return result;
    }
    async deleteAttachmentsByRequestId(requestId: string) {
        const result = await this.attachmentRepository.deleteAttachmentsByRequestId(requestId);
        return result;
    }
    async findAttachmentById(id: string) {
        const result = await this.attachmentRepository.findAttachmentById(id);
        return result;
    }
}
