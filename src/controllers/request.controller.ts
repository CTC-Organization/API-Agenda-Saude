import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Put,
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
import { CreateRequestDto } from '@/dto/create-request.dto';
import { ValidateIsUserSelfOrAdminOrEmployee } from '@/commons/guards/validate-self-or-admin-or-employee.guard';
import { AuthGuard } from '../commons/guards/auth.guard';
import { UpdateRequestDto } from '@/dto/update-request.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UserInterceptor } from '@/commons/interceptors/user.interceptor';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@UseInterceptors(UserInterceptor)
@Controller('requests')
@ApiTags('Requisições: requests')
export class RequestController {
    constructor(private readonly requestService: RequestService) {}

    @Post()
    @UseInterceptors(AnyFilesInterceptor())
    async createRequest(
        // parametro detectando para apenas esse id do patient/admin ou employee
        // (baseado na autorização acima)
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
                ],
            }),
        )
        files: Array<Express.Multer.File>,
        @Req() req: any,
        @Body()
        {
            date,
            serviceTokenId,
        }: {
            date: string;
            serviceTokenId: string;
        },
    ) {
        return await this.requestService.createRequest(files, {
            patientId: req.user.id,
            date,
            serviceTokenId,
        });
    }

    @Patch()
    async updateRequest(@Req() req: any, @Body() { date, requestId }: UpdateRequestDto) {
        return await this.requestService.updateRequest({ patientId: req.user.id, date, requestId });
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
}
