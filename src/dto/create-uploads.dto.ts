import { UploadType } from '@prisma/postgres-client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUploadsDto {
    @IsNotEmpty()
    readonly files: Array<Express.Multer.File>;

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
