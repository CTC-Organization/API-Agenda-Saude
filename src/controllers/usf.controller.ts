import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { UsfService } from '@/services/usf.service';
import { ApiTags } from '@nestjs/swagger';
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
        { fields, records }: { fields: any[]; records: any[][] },
    ) {
        const formattedRecords = records.map((record: any[]) => {
            let recordObj: any = {};
            fields.forEach((field: any, index: number) => {
                if (field.id === 'endereço') field.id = 'endereco';
                recordObj[field.id] = record[index];
            });
            return recordObj;
        });

        return await this.usfService.createUsfList(formattedRecords);
    }
    @Get('find-by-health-district/:id')
    async listUsfsByHealthDistrictId(@Param('id') id: number) {
        return await this.usfService.listUsfsByHealthDistrict(id);
    }
    @Get()
    async listUsfs() {
        return await this.usfService.listUsfs();
    }
    @Post('find-unique-by-coordenates')
    async findUsfByCoordenates(
        @Body() { latitude, longitude }: { latitude: string; longitude: number },
    ) {
        return await this.usfService.findUsfByCoordenates({
            latitude,
            longitude,
        });
    }
    @Post('find-many-by-coordenates')
    async findUsfsByCoordenates(
        @Body() { latitude, longitude }: { latitude: string; longitude: number },
    ) {
        return await this.usfService.findUsfsByCoordenates({
            latitude,
            longitude,
        });
    }
}
