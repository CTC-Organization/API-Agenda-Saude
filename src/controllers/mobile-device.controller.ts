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
import { MobileDeviceService } from '@/services/mobile-device.service';

@UseGuards(AuthGuard)
@UseInterceptors(UserInterceptor)
@Controller('mobile-devices')
@ApiTags('Dispositivos módeis: mobile-devices')
export class MobileDeviceController {
    constructor(private readonly mobileDeviceService: MobileDeviceService) {}

    @Post(':id')
    @UseInterceptors(AnyFilesInterceptor())
    async mobileDeviceCheckIn(
        @Req() req: any,
        @Param('id') patientId: string,
        @Body() { expoToken }: { expoToken: string },
    ) {
        if (req.user.id !== patientId) {
            throw new UnauthorizedException('Credenciais incompatíveis com o usuário');
        }
        return await this.mobileDeviceService.mobileDeviceCheckIn({
            patientId,
            expoToken,
        });
    }
}
