import { Injectable } from '@nestjs/common';
import { HealthDistrictRepository } from '../repositories/health-district.repository';
import { CreateHealthDistrictDto } from '@/dto/create-health-district.dto';

@Injectable()
export class HealthDistrictService {
    constructor(private healthdistrictRepository: HealthDistrictRepository) {}

    async createHealthDistricts(createHealthDistrictDto: CreateHealthDistrictDto[]) {
        try {
            const healthDistrict = await this.healthdistrictRepository.createHealthDistricts(
                createHealthDistrictDto,
            );
            return healthDistrict;
        } catch (err) {
            throw err;
        }
    }
    async findHealthDistrictByCoordenates({
        latitude,
        longitude,
    }: {
        latitude: string;
        longitude: number;
    }) {
        const result = await this.healthdistrictRepository.findHealthDistrictByCoordinates({
            latitude,
            longitude,
        });
        return result;
    }
}
