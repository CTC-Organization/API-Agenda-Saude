import { CreateCityHallDto } from '@/dto/create-city-hall.dto';
import { CreateUsfDto } from '@/dto/create-usf.dto';

export abstract class CityHallRepository {
    abstract createCityHall(CreateCityHallDto: CreateCityHallDto): Promise<any>;
    abstract findCityHallById(id: string): Promise<any>;
    // abstract findAll(): Promise<any>;
}
