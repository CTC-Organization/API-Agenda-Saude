import { CreateUploadDto } from '../dto/create-upload.dto';
import { CreateUploadsOnRequestDto } from '@/dto/create-uploads-on-request.dto';
import { CreateUploadsDto } from '../dto/create-uploads.dto';
import { Prisma } from '@prisma/postgres-client';

export abstract class UploadRepository {
    abstract createUpload(createUploadDto: CreateUploadDto): Promise<any>;
    abstract createUploads(createUploadsDto: CreateUploadsDto): Promise<any>;
    abstract findAllUploadsByUserId(referenceId: string): Promise<any>;
    abstract deleteUpload(uploadId: string): Promise<any>;
    abstract deleteUploads(uploadIds: Array<string>): Promise<any>;
    abstract deleteUploadsByUserId(requestId: string): Promise<any>;
    abstract findUploadById(id: string): Promise<any>;
}
