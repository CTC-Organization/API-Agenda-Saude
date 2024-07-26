import { CreateAttachmentDto } from '@/dto/create-attachment.dto';
import { CreateAttachmentsDto } from '@/dto/create-attachments.dto';

export abstract class AttachmentRepository {
    abstract createAttachment(createAttachmentDto: CreateAttachmentDto): Promise<any>;
    abstract createAttachments(createAttachmentsDto: CreateAttachmentsDto): Promise<any>;
    abstract findAllAttachmentsByRequestId(referenceId: string): Promise<any>;
    abstract deleteAttachment(attachment: string): Promise<any>;
    abstract findAttachmentById(id: string): Promise<any>;
}
