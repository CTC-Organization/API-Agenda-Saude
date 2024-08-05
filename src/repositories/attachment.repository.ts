import { CreateAttachmentDto } from '../dto/create-attachment.dto';
import { CreateAttachmentsOnRequestDto } from '@/dto/create-attachments-on-request.dto';
import { CreateAttachmentsDto } from '../dto/create-attachments.dto';
import { Prisma } from '@prisma/postgres-client';

export abstract class AttachmentRepository {
    abstract createAttachment(createAttachmentDto: CreateAttachmentDto): Promise<any>;
    abstract createAttachments(createAttachmentsDto: CreateAttachmentsDto): Promise<any>;
    abstract findAllAttachmentsByRequestId(referenceId: string): Promise<any>;
    abstract deleteAttachment(attachmentId: string): Promise<any>;
    abstract deleteAttachments(attachmentIds: Array<string>): Promise<any>;
    abstract deleteAttachmentsByRequestId(requestId: string): Promise<any>;
    abstract findAttachmentById(id: string): Promise<any>;
}
