import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';

import { CityHallService } from '@/services/city-hall.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateCityHallDto } from '@/dto/create-city-hall.dto';
import { AuthGuard } from '@/commons/guards/auth.guard';
import { ValidateIsAdminOrEmployee } from '@/commons/guards/validate-admin-or-employee.guard';

@ApiTags('Prefeituras: cityhalls')
@Controller('city-halls')
@UseGuards(AuthGuard)
export class CityHallController {
    constructor(private readonly cityhallService: CityHallService) {}
    @UseGuards(ValidateIsAdminOrEmployee)
    @Post()
    async createCityHall(
        @Body() createCityHallDto: CreateCityHallDto,
    ) {
        return await this.cityhallService.createCityHall(
            createCityHallDto
        );
    }
    @Get(':id')
    async findCityHallById(@Param('id') id: string) {return await this.cityhallService.findCityHallById(id)}
}
