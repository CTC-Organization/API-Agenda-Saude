import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { HealthDistrictService } from '@/services/health-district.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/commons/guards/auth.guard';
import { ValidateIsAdminOrEmployee } from '@/commons/guards/validate-admin-or-employee.guard';

@ApiTags('Distritos sanitários: healthDistricts')
@Controller('health-districts')
@UseGuards(AuthGuard)
export class HealthDistrictController {
    constructor(private readonly healthdistrictService: HealthDistrictService) {}
    @UseGuards(ValidateIsAdminOrEmployee)
    @Post()
    async createHealthDistricts(@Body() { fields, records }: { fields: any[]; records: any[][] }) {
        const formattedRecords = records.map((record: any[]) => {
            let recordObj: any = {};
            fields.forEach((field: any, index: number) => {
                recordObj[field.id] = record[index];
            });
            return recordObj;
        });

        return await this.healthdistrictService.createHealthDistricts(formattedRecords);
    }
    @Get()
    async findHealthDistrictByCoordenates(
        @Body() { latitude, longitude }: { latitude: string; longitude: number },
    ) {
        return await this.healthdistrictService.findHealthDistrictByCoordenates({
            latitude,
            longitude,
        });
    }
}
