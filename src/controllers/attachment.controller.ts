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
import { AttachmentService } from '@/services/attachment.service';
import { AuthGuard } from '@/commons/guards/auth.guard';
import { AttachmentType } from '@prisma/postgres-client';
import { ValidateIsUserSelfOrAdminOrEmployee } from '@/commons/guards/validate-self-or-admin-or-employee.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Anexos: attachments')
@Controller('attachments')
@UseGuards(AuthGuard)
export class AttachmentController {
    constructor(private readonly attachmentService: AttachmentService) {}

    @Get('attachment-by-request')
    async findAllAttachmentsByRequestId(@Query() referenceId: string) {
        return await this.attachmentService.findAllAttachmentsByRequestId(referenceId);
    }

    @Post()
    @UseInterceptors(FileInterceptor('attachment'))
    async createAttachment(
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
            attachmentType,
            folder,
        }: { referenceId: string; attachmentType: AttachmentType; folder: string },
    ) {
        return await this.attachmentService.createAttachment({
            file,
            referenceId,
            attachmentType,
            folder,
        });
    }
    @Post('multiple-attachments')
    @UseInterceptors(AnyFilesInterceptor())
    async createAttachments(
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
            attachmentType,
            folder,
        }: { referenceId: string; attachmentType: AttachmentType; folder: string },
    ) {
        return await this.attachmentService.createAttachments({
            files,
            referenceId,
            attachmentType,
            folder,
        });
    }
    @Delete(':id')
    async deleteAttachment(@Param('id') attachmentId: string) {
        return await this.attachmentService.deleteAttachment(attachmentId);
    }
    @Delete('multiple-attachments')
    async deleteAttachments(@Body() attachmentIds: Array<string>) {
        return await this.attachmentService.deleteAttachments(attachmentIds);
    }
    @Delete('by-request/:id')
    async deleteAttachmentsByRequestId(@Param('id') requestId: string) {
        return await this.attachmentService.deleteAttachmentsByRequestId(requestId);
    }
}
