import {
    Controller,
    Delete,
    FileTypeValidator,
    Get,
    HttpCode,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Post,
    Query,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('uploads')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Get()
    async getAllFiles() {
        return await this.uploadService.getAllFiles();
    }
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|csv)$/ }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // Máximo de 5 MB
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return await this.uploadService.uploadFile(file, 'temp');
    }

    @Post('/multiple-files')
    @UseInterceptors(AnyFilesInterceptor())
    async uploadFiles(
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|csv)$/ }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
                ],
            }),
        )
        files: Array<Express.Multer.File>,
    ) {
        return await this.uploadService.uploadFiles(files, 'temp');
    }
}
