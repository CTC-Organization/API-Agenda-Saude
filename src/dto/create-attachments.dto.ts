import { AttachmentType } from '@prisma/postgres-client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAttachmentsDto {
    @IsNotEmpty()
    readonly files: Array<Express.Multer.File>;

    @IsString()
    @IsNotEmpty()
    readonly folder: string;

    @IsNotEmpty()
    @IsString()
    readonly attachmentType: AttachmentType;

    @IsNotEmpty()
    @IsString()
    readonly referenceId: string;
}
