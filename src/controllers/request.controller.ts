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
    UnauthorizedException,
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
import { ValidateIsAdminOrEmployee } from '@/commons/guards/validate-admin-or-employee.guard';
import { ValidateIsUserSelf } from '@/commons/guards/validate-self.guard';

@UseGuards(AuthGuard)
@UseInterceptors(UserInterceptor)
@Controller('requests')
@ApiTags('Requisições: requests')
export class RequestController {
    constructor(private readonly requestService: RequestService) { }

    @Post('request-without-service-token')
    @UseInterceptors(AnyFilesInterceptor())
    async createRequestWithoutServiceToken(
        @Req() req: any,
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
        if (req.user.id !== patientId) {
            throw new UnauthorizedException(
                'Não é possível reenviar requisições para outros pacientes.',
            );
        }
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
        @Req() req: any,
        @Body()
        {
            specialty,
            serviceTokenId,
            patientId,
        }: {
            serviceTokenId: string;
            patientId: string;
            specialty: string;
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
        if (req.user.id !== patientId) {
            throw new UnauthorizedException(
                'Não é possível reenviar requisições para outros pacientes.',
            );
        }
        return await this.requestService.createRequest(
            {
                specialty,
                patientId,
                serviceTokenId,
            },
            files,
        );
    }
    @Post('resend')
    @UseInterceptors(AnyFilesInterceptor())
    async resendRequest(
        @Req() req: any,
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
        if (req.user.id !== patientId) {
            throw new UnauthorizedException(
                'Não é possível reenviar requisições para outros pacientes.',
            );
        }
        return await this.requestService.resendRequest(
            {
                requestId,
                patientId,
                specialty,
            },
            files,
        );
    }

    @Get(':id') // id da request != id do paciente
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    async findRequestById(
        @Req() req: any,
        @Param('id') id: string,
        @Body() { patientId }: { patientId: string }) {
        return await this.requestService.findRequestById(id);
    }
    @Get('patient-requests/:id')
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    async listRequestsByPatientId(@Param('id') id: string) {
        return await this.requestService.listRequestsByPatientId(id);
    }
    @Patch('cancel/:id')
    async cancelRequest(
        @Req() req: any,
        @Param('id') id: string,
        @Body() { patientId }: { patientId: string },
    ) {
        if (req.user.id !== patientId) {
            throw new UnauthorizedException(
                'Não é possível reenviar requisições para outros pacientes.',
            );
        }
        return await this.requestService.cancelRequest(id);
    }

    @Patch('complete/:id')
    async completeRequest(
        @Req() req: any,
        @Param('id') id: string,
        @Body() { patientId }: { patientId: string },
    ) {
        if (req.user.id !== patientId) {
            throw new UnauthorizedException(
                'Não é possível reenviar requisições para outros pacientes.',
            );
        }
        return await this.requestService.completeRequest(id);
    }

    @Patch('accept/:id')
    @UseGuards(ValidateIsAdminOrEmployee)
    async acceptRequest(
        @Param('id') requestId: string,
        @Body() acceptRequestDto: AcceptRequestDto,
    ) {
        return await this.requestService.acceptRequest(requestId, acceptRequestDto);
    }

    @UseGuards(ValidateIsAdminOrEmployee)
    @Patch('deny/:id')
    async denyRequest(@Param('id') id: string, @Body() { observation }: { observation: string }) {
        return await this.requestService.denyRequest(id, observation);
    }

    @Patch('confirm/:id')
    async confirmRequest(
        @Req() req: any,
        @Param('id') id: string,
        @Body() { patientId }: { patientId: string },
    ) {
        if (req.user.id !== patientId) {
            throw new UnauthorizedException(
                'Não é possível reenviar requisições para outros pacientes.',
            );
        }
        return await this.requestService.confirmRequest(id);
    }

    // @UseGuards(ValidateIsAdminOrEmployee)
    @Get()
    @UseGuards(ValidateIsAdminOrEmployee)
    async listAllRequests() {
        return await this.requestService.listAllRequests();
    }
}
