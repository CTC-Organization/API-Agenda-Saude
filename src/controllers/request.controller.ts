import { Controller, Post, Body, Get, Param, Put, Patch, UseGuards } from '@nestjs/common';
import { RequestService } from '../services/request.service';
import { CreateRequestDto } from '@/dto/create-request.dto';
import { ValidateIsUserSelfOrAdminOrEmployee } from '@/commons/guards/validate-self-or-admin-or-employee.guard';
import { AuthGuard } from '../commons/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('requests')
export class RequestController {
    constructor(private readonly requestService: RequestService) {}

    @Post(':id')
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    async createRequest(@Param('id') id: string) {
        return await this.requestService.createRequest(id);
    }
    @Patch(':id')
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    async updateRequest(@Param('id') id: string) {
        return await this.requestService.updateRequest(id);
    }
    @Get(':id')
    async findRequestById(@Param('id') id: string) {
        return await this.requestService.findRequestById(id);
    }
    @Get('list/:id')
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    async listRequestsByPatientId(@Param('id') id: string) {
        return await this.requestService.listRequestsByPatientId(id);
    }
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @Patch('cancel/:id')
    async cancelRequest(@Param('id') id: string) {
        return await this.requestService.cancelRequest(id);
    }

    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @Patch('complete/:id')
    async completeRequest(@Param('id') id: string) {
        return await this.requestService.completeRequest(id);
    }
}
