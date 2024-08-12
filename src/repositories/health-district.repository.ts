import { CreateHealthDistrictDto } from '@/dto/create-health-district.dto';

export abstract class HealthDistrictRepository {
    abstract createHealthDistricts(
        CreateHealthDistrictDto: Array<CreateHealthDistrictDto>,
    ): Promise<any>;
    abstract findHealthDistrictByCoordinates({
        latitude,
        longitude,
    }: {
        latitude: string;
        longitude: number;
    }): Promise<any>;
}
