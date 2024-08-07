import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

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
    async createUsfs(
        @Body()
        { fields, records, cityHallId }: { fields: any[]; records: any[][]; cityHallId: string },
    ) {
        const formattedRecords = records.map((record: any[]) => {
            let recordObj: any = {};
            recordObj['cityHallId'] = cityHallId;
            fields.forEach((field: any, index: number) => {
                if (field.id === 'endereço') field.id = 'endereco';
                recordObj[field.id] = record[index];
            });
            return recordObj;
        });

        return await this.usfService.createUsfList(formattedRecords);
    }
    @Get('by-city-hall/:id')
    async listByCityHallId(@Param('id') id: string) {
        return await this.usfService.listByCityHallId(id);
    }
}
