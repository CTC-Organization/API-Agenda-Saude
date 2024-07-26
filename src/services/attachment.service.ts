import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttachmentDto } from '@/dto/create-attachment.dto';
import { AttachmentRepository } from '@/repositories/attachment.repository';
import { z } from 'zod';
import { AttachmentType } from '@prisma/client';
// export const CreateAttachmentSchema = z.object({
//     patientId: z.string().length(1, 'É obrigatório o ID de um paciente'),
// });

@Injectable()
export class AttachmentService {
    constructor(private attachmentRepository: AttachmentRepository) {}

    async createAttachment({
        file,
        attachmentType,
        referenceId,
    }: {
        file: Express.Multer.File;
        attachmentType: AttachmentType;
        referenceId: string;
    }) {
        try {
            return await this.attachmentRepository.createAttachment({
                file,
                attachmentType,
                referenceId,
            });
        } catch (err) {
            throw err;
        }
    }
    async createAttachments({
        files,
        attachmentType,
        referenceId,
    }: {
        files: Array<Express.Multer.File>;
        attachmentType: AttachmentType;
        referenceId: string;
    }) {
        const result = await this.attachmentRepository.createAttachments({
            files,
            attachmentType,
            referenceId,
        });
        return result;
    }
    async findAllAttachmentsByRequestId(referenceId: string) {
        const result = await this.attachmentRepository.findAllAttachmentsByRequestId(referenceId);
        return result;
    }
    async deleteAttachment(attachment: string) {
        const result = await this.attachmentRepository.deleteAttachment(attachment);
        return result;
    }
    async findAttachmentById(id: string) {
        const result = await this.attachmentRepository.findAttachmentById(id);
        return result;
    }
}
