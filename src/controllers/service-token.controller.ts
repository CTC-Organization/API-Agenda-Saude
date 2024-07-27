import { Controller, Post, Body, Get, Param, Put, Patch, UseGuards } from '@nestjs/common';
import { ServiceTokenService } from '../services/service-token.service';
import { CreateServiceTokenDto } from '@/dto/create-service-token.dto';
import { ValidateIsUserSelfOrAdminOrEmployee } from '@/commons/guards/validate-self-or-admin-or-employee.guard';
import { AuthGuard } from '../commons/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('service-tokens')
export class ServiceTokenController {
    constructor(private readonly servicetokenService: ServiceTokenService) {}

    @Post(':id')
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    async createServiceToken(@Param('id') id: string) {
        return await this.servicetokenService.createServiceToken(id);
    }
    @Get(':id')
    async findServiceTokenById(@Param('id') id: string) {
        return await this.servicetokenService.findServiceTokenById(id);
    }
    @Get('list/:id')
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    async listServiceTokensByPatientId(@Param('id') id: string) {
        return await this.servicetokenService.listServiceTokensByPatientId(id);
    }
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @Patch('cancel/:id')
    async cancelServiceToken(@Param('id') id: string) {
        return await this.servicetokenService.cancelServiceToken(id);
    }

    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @Patch('complete/:id')
    async completeServiceToken(@Param('id') id: string) {
        return await this.servicetokenService.completeServiceToken(id);
    }
}
