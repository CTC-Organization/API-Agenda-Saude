import { AttachmentType } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAttachmentsOnRequestDto {
    @IsNotEmpty()
    readonly files: Array<Express.Multer.File>;

    @IsString()
    @IsNotEmpty()
    readonly folder: string;

    @IsNotEmpty()
    @IsString()
    readonly attachmentType: AttachmentType;
}
