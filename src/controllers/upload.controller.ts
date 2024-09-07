import {
    Body,
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
import { UploadService } from '@/services/upload.service';
import { AuthGuard } from '@/commons/guards/auth.guard';
import { UploadType } from '@prisma/postgres-client';
import { ValidateIsUserSelfOrAdminOrEmployee } from '@/commons/guards/validate-self-or-admin-or-employee.guard';
import { ApiTags } from '@nestjs/swagger';
import { ValidateIsUserSelf } from '@/commons/guards/validate-self.guard';

@ApiTags('Anexos: uploads')
@Controller('uploads')
@UseInterceptors(UseInterceptors)
@UseGuards(AuthGuard)
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Get('uploads-by-user')
    async findAllUploadsByUserIdId(@Query() userId: string) {
        return await this.uploadService.findAllUploadsByUserId(userId);
    }

    @Get(':id')
    async findUploadById(@Param('id') id: string) {
        return await this.uploadService.findUploadById(id);
    }
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async createUpload(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
                ],
            }),
        )
        file: Express.Multer.File,
        @Body()
        {
            referenceId,
            uploadType,
            folder,
        }: { referenceId: string; uploadType: UploadType; folder: string },
    ) {
        return await this.uploadService.createUpload({
            file,
            referenceId,
            uploadType,
            folder,
        });
    }
    @Post('multiple-uploads')
    @UseInterceptors(AnyFilesInterceptor())
    async createUploads(
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
                ],
            }),
        )
        files: Array<Express.Multer.File>,
        @Body()
        {
            referenceId,
            uploadType,
            folder,
        }: { referenceId: string; uploadType: UploadType; folder: string },
    ) {
        return await this.uploadService.createUploads({
            files,
            referenceId,
            uploadType,
            folder,
        });
    }
    @Delete(':id')
    async deleteUpload(@Param('id') uploadId: string) {
        return await this.uploadService.deleteUpload(uploadId);
    }
    @Delete('multiple-uploads')
    async deleteUploads(@Body() uploadIds: Array<string>) {
        return await this.uploadService.deleteUploads(uploadIds);
    }
    @Delete('by-user/:id')
    async deleteUploadsByUserIdId(@Param('id') userId: string) {
        return await this.uploadService.deleteUploadsByUserId(userId);
    }
}
