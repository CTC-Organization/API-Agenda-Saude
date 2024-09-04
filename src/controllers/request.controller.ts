import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    UseGuards,
    FileTypeValidator,
    MaxFileSizeValidator,
    ParseFilePipe,
    UploadedFiles,
    UseInterceptors,
    Req,
} from '@nestjs/common';
import { RequestService } from '../services/request.service';
import { ValidateIsUserSelfOrAdminOrEmployee } from '@/commons/guards/validate-self-or-admin-or-employee.guard';
import { AuthGuard } from '../commons/guards/auth.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UserInterceptor } from '@/commons/interceptors/user.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { request } from 'express';
import { AcceptRequestDto } from '@/dto/accept-request.dto';

@UseGuards(AuthGuard)
@UseInterceptors(UserInterceptor)
@Controller('requests')
@ApiTags('Requisições: requests')
export class RequestController {
    constructor(private readonly requestService: RequestService) {}

    @Post('request-without-service-token')
    @UseInterceptors(AnyFilesInterceptor())
    async createRequestWithoutServiceToken(
        @Req() req: any,
        @UploadedFiles(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                ],
            }),
        )
        files?: Array<Express.Multer.File>,
    ) {
        return await this.requestService.createRequestWithoutServiceToken(
            {
                patientId: req.user.id,
            },
            files,
        );
    }
    @Post()
    @UseInterceptors(AnyFilesInterceptor())
    async createRequest(
        @Req() req: any,
        @Body()
        {
            date,
            serviceTokenId,
        }: {
            date: string;
            serviceTokenId: string;
        },
        @UploadedFiles(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
                ],
            }),
        )
        files?: Array<Express.Multer.File>,
    ) {
        return await this.requestService.createRequest(
            {
                patientId: req.user.id,
                date,
                serviceTokenId,
            },
            files,
        );
    }
    @Post('resend/:id')
    @UseInterceptors(AnyFilesInterceptor())
    async resendRequest(
        @Param('id') requestId,
        @Req() req: any,
        @UploadedFiles(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                ],
            }),
        )
        files?: Array<Express.Multer.File>,
    ) {
        return await this.requestService.resendRequest(
            {
                requestId,
                patientId: req.user.id,
            },
            files,
        );
    }

    @Get(':id')
    async findRequestById(@Param('id') id: string) {
        return await this.requestService.findRequestById(id);
    }
    @Get('patient-requests/:id')
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    async listRequestsByPatientId(@Param('id') id: string) {
        return await this.requestService.listRequestsByPatientId(id);
    }
    @Patch('cancel/:id')
    async cancelRequest(@Param('id') id: string) {
        return await this.requestService.cancelRequest(id);
    }

    @Patch('complete/:id')
    async completeRequest(@Param('id') id: string) {
        return await this.requestService.completeRequest(id);
    }

    @Patch('accept/:id')
    async acceptRequest(
        @Param('id') requestId: string,
        @Body() acceptRequestDto: AcceptRequestDto,
    ) {
        return await this.requestService.acceptRequest(requestId, acceptRequestDto);
    }

    @Patch('deny/:id')
    async denyRequest(@Param('id') id: string) {
        return await this.requestService.denyRequest(id);
    }

    @Patch('confirm/:id')
    async confirmRequest(@Param('id') id: string) {
        return await this.requestService.confirmRequest(id);
    }

    // @UseGuards(ValidateIsAdminOrEmployee)
    @Get()
    async listAllRequests() {
        return await this.requestService.listAllRequests();
    }
}
