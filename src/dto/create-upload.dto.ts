import { UploadType } from '@prisma/postgres-client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUploadDto {
    @IsNotEmpty()
    readonly file: Express.Multer.File;

    @IsString()
    @IsNotEmpty()
    readonly folder: string;

    @IsNotEmpty()
    @IsString()
    readonly uploadType: UploadType;

    @IsNotEmpty()
    @IsString()
    readonly referenceId: string;
}
