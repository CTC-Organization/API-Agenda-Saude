import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';

import { UsfService } from '@/services/usf.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUsfDto } from '@/dto/create-usf.dto';
import { AuthGuard } from '@/commons/guards/auth.guard';
import { ValidateIsAdminOrEmployee } from '@/commons/guards/validate-admin-or-employee.guard';

@ApiTags('Unidades de saúde da família: usfs')
@Controller('usfs')
@UseGuards(AuthGuard)
export class UsfController {
    constructor(private readonly usfService: UsfService) {}
    @UseGuards(ValidateIsAdminOrEmployee)
    @Post()
    async createUsf(
        @Body() createUsfListDto: CreateUsfDto[],
    ) {
        return await this.usfService.createUsfList(
            createUsfListDto
        );
    }
    @Get('by-city-hall/:id')
    async listByCityHallId(@Param('id') id: string) {return await this.usfService.listByCityHallId(id)}
}
