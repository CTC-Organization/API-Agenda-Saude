import { Controller, Post, Body, Get, Param, Put, Patch, UseGuards } from '@nestjs/common';
import { ServiceTokenService } from '../services/service-token.service';
import { CreateServiceTokenDto } from '@/dto/create-service-token.dto';
import { ValidateIsUserSelfOrAdminOrEmployee } from '@/commons/guards/validate-self-or-admin-or-employee.guard';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiTags('Fichas de atendimento: service-tokens')
@Controller('service-tokens')
export class ServiceTokenController {
    constructor(private readonly servicetokenService: ServiceTokenService) {}

    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @Get('patient-service-tokens/:id')
    async listServiceTokensByPatientId(@Param('id') id: string) {
        return await this.servicetokenService.listServiceTokensByPatientId(id);
    }
    @Get('list/:id')
    async findServiceTokenById(@Param('id') id: string) {
        return await this.servicetokenService.findServiceTokenById(id);
    }

    @Get('unique-valid/:id')
    async findValidServiceTokenByPatientId(@Param('id') id: string) {
        return await this.servicetokenService.findValidServiceTokenByPatientId(id);
    }

    @Post(':id')
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    async createServiceToken(
        @Param('id') id: string,
        @Body() { expirationDate }: { expirationDate: string },
    ) {
        return await this.servicetokenService.createServiceToken({
            patientId: id,
            expirationDate: expirationDate,
        });
    }

    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @Patch('cancel/:id')
    async cancelServiceTokenByPatientId(@Param('id') id: string) {
        return await this.servicetokenService.cancelServiceTokenByPatientId(id);
    }

    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @Patch('complete/:id')
    async completeServiceTokenByPatientId(@Param('id') id: string) {
        return await this.servicetokenService.completeServiceTokenByPatientId(id);
    }
}
