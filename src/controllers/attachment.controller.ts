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
import { AttachmentType } from '@prisma/client';
import { ValidateIsUserSelfOrAdminOrEmployee } from '@/commons/guards/validate-self-or-admin-or-employee.guard';

@Controller('attachments')
@UseGuards(AuthGuard)
export class AttachmentController {
    constructor(private readonly attachmentService: AttachmentService) {}

    @Get('/attachment-by-request/:id') // está sendo usado apenas para o middleware (GUARD validate-self...)
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
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
        { referenceId, attachmentType }: { referenceId: string; attachmentType: AttachmentType },
    ) {
        return await this.attachmentService.createAttachment({ file, referenceId, attachmentType });
    }
    @Post('/multiple-attachments')
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
        { referenceId, attachmentType }: { referenceId: string; attachmentType: AttachmentType },
    ) {
        return await this.attachmentService.createAttachments({
            files,
            referenceId,
            attachmentType,
        });
    }
    @HttpCode(204)
    @Delete(':attachment')
    async deleteAttachment(@Param('attachment') attachment: string) {
        return await this.attachmentService.deleteAttachment(attachment);
    }
}
