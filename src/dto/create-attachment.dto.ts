import { AttachmentType } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAttachmentDto {
    @IsNotEmpty()
    readonly file: Express.Multer.File;

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
