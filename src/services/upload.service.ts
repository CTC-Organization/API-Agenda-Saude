import { Injectable } from '@nestjs/common';
import { UploadRepository } from '@/repositories/upload.repository';
import { UploadType } from '@prisma/postgres-client';

@Injectable()
export class UploadService {
    constructor(private uploadRepository: UploadRepository) {}
    async createUpload({
        file,
        uploadType,
        referenceId,
        folder,
    }: {
        file: Express.Multer.File;
        uploadType: UploadType;
        referenceId: string;
        folder: string;
    }) {
        try {
            return await this.uploadRepository.createUpload({
                file,
                uploadType,
                referenceId,
                folder,
            });
        } catch (err) {
            throw err;
        }
    }
    async createUploads({
        files,
        uploadType,
        referenceId,
        folder,
    }: {
        files: Array<Express.Multer.File>;
        uploadType: UploadType;
        referenceId: string;
        folder: string;
    }) {
        const result = await this.uploadRepository.createUploads({
            files,
            uploadType,
            referenceId,
            folder,
        });
        return result;
    }
    async findAllUploadsByUserId(referenceId: string) {
        const result = await this.uploadRepository.findAllUploadsByUserId(referenceId);
        return result;
    }
    async deleteUpload(uploadId: string) {
        const result = await this.uploadRepository.deleteUpload(uploadId);
        return result;
    }
    async deleteUploadsByUserId(userId: string) {
        const result = await this.uploadRepository.deleteUploadsByUserId(userId);
        return result;
    }
    async deleteUploads(attachementIds: Array<string>) {
        const result = await this.uploadRepository.deleteUploads(attachementIds);
        return result;
    }
    async findUploadById(id: string) {
        const result = await this.uploadRepository.findUploadById(id);
        return result;
    }
}
