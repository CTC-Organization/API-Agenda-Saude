import { Injectable } from '@nestjs/common';
import { CityHallRepository } from './city-hall.repository';
import { MongoPrismaService } from '../services/mongo-prisma.service';
import { CreateCityHallDto } from '@/dto/create-city-hall.dto';
import { BrazilianState } from '@prisma/mongodb-client';

@Injectable()
export class CityHallPrismaRepository implements CityHallRepository {
    constructor(public prisma: MongoPrismaService) {
    }

    async createCityHall({
        name,
        state,
    }: CreateCityHallDto): Promise<any> {
        return await this.prisma.cityHall.create({
            data: {
                name,
                state,
            },
        });
    }

    async findCityHallById(id: string): Promise<any> {
        return await this.prisma.cityHall.findFirst({
            where: {
                id,
            },
            include: {
                usfs: true,
            }
        });
    }

    async findCityHallByOfficialName(name:string,state: BrazilianState): Promise<any> {
        return await this.prisma.cityHall.findFirst({
            where: {
                name,
                state,
            },
            include: {
                usfs: true,
            }
        });
    }
    
}
