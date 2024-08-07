import { BadRequestException, Injectable } from '@nestjs/common';
import { CityHallRepository } from '../repositories/city-hall.repository';
import { CreateCityHallDto } from '@/dto/create-city-hall.dto';

@Injectable()
export class CityHallService {
    constructor(private cityhallRepository: CityHallRepository) {}

    async createCityHall(createCityHallDto: CreateCityHallDto) {
        try {
            // const foundCityHall =await this.cityhallRepository.findCityHallByOfficialName(createCityHallDto.name,createCityHallDto.state)
            // if(!!foundCityHall) throw new BadRequestException("Prefeitura já cadastrada")
            const cityHall = await this.cityhallRepository.createCityHall(createCityHallDto);
            return cityHall;
        } catch (err) {
            throw err;
        }
    }
    async findCityHallById(cityHallId: string) {
        const result = await this.cityhallRepository.findCityHallById(cityHallId);
        return result;
    }
}
