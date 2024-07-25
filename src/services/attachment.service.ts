import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttachmentDto } from '@/dto/create-attachment.dto';
import { AttachmentRepository } from '@/repositories/attachment.repository';
import { z } from 'zod';

// export const CreateAttachmentSchema = z.object({
//     patientId: z.string().length(1, 'É obrigatório o ID de um paciente'),
// });

@Injectable()
export class AttachmentService {
    constructor(private attachmentRepository: AttachmentRepository) {}

    async createAttachment(patientId: string) {
        try {
            // CreateAttachmentSchema.parse(data);
            // const { patientId } = data;

            return await this.attachmentRepository.createAttachment({ patientId });
        } catch (err) {
            throw err;
        }
    }
    async findAttachmentById(id: string) {
        const result = await this.attachmentRepository.findAttachmentById(id);
        return result;
    }
}
