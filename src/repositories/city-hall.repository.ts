import { CreateCityHallDto } from '@/dto/create-city-hall.dto';
import { BrazilianState } from '@prisma/mongodb-client';


export abstract class CityHallRepository {
    abstract createCityHall(CreateCityHallDto: CreateCityHallDto): Promise<any>;
    abstract findCityHallById(id: string): Promise<any>;
    abstract findCityHallByOfficialName(name:string,state: BrazilianState): Promise<any>;

}
