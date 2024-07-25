import { CreateAttachmentDto } from '@/dto/create-attachment.dto';

export abstract class AttachmentRepository {
    abstract createAttachment(createAttachmentDto: CreateAttachmentDto): Promise<any>;
    abstract findAttachmentById(id: string): Promise<any>;
}
