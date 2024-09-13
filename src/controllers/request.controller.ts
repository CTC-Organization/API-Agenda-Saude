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
import { CreateRequestWithoutServiceTokenDto } from '@/dto/create-request-without-service-token.dto';
import { ResendRequestDto } from '@/dto/resend-request.dto';

@UseGuards(AuthGuard)
@UseInterceptors(UserInterceptor)
@Controller('requests')
@ApiTags('Requisições: requests')
export class RequestController {
    constructor(private readonly requestService: RequestService) {}

    @Post('request-without-service-token')
    @UseInterceptors(AnyFilesInterceptor())
    async createRequestWithoutServiceToken(
        @Body() { patientId, specialty }: CreateRequestWithoutServiceTokenDto,
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
                patientId,
                specialty,
            },
            files,
        );
    }
    @Post()
    @UseInterceptors(AnyFilesInterceptor())
    async createRequest(
        @Body()
        {
            date,
            serviceTokenId,
            patientId,
        }: {
            date: string;
            serviceTokenId: string;
            patientId: string;
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
                patientId,
                date,
                serviceTokenId,
            },
            files,
        );
    }
    @Post('resend')
    @UseInterceptors(AnyFilesInterceptor())
    async resendRequest(
        @Body() { patientId, specialty, requestId }: ResendRequestDto,
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
                patientId,
                specialty,
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
    async denyRequest(@Param('id') id: string, @Body() { observation }: { observation: string }) {
        return await this.requestService.denyRequest(id, observation);
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
