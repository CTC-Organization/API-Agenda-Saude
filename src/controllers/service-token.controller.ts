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
    createServiceToken(@Param('id') id: string) {
        return this.servicetokenService.createServiceToken(id);
    }
    @Get(':id')
    findServiceTokenById(@Param('id') id: string) {
        return this.servicetokenService.findServiceTokenById(id);
    }
    @Get('list/:id')
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    listServiceTokensByPatientId(@Param('id') id: string) {
        return this.servicetokenService.listServiceTokensByPatientId(id);
    }
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @Patch('cancel/:id')
    cancelServiceToken(@Param('id') id: string) {
        return this.servicetokenService.cancelServiceToken(id);
    }

    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @Patch('complete/:id')
    completeServiceToken(@Param('id') id: string) {
        return this.servicetokenService.completeServiceToken(id);
    }
}
