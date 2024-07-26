import { AttachedEnhancerDefinition } from '@nestjs/core/inspector/interfaces/extras.interface';
import { AttachmentType } from '@prisma/client';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAttachmentDto {
    @IsNotEmpty()
    readonly file: Express.Multer.File;

    @IsNotEmpty()
    @IsString()
    readonly attachmentType: AttachmentType;

    @IsNotEmpty()
    @IsString()
    readonly referenceId: string;
}
