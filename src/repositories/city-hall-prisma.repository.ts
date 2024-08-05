import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CityHallRepository } from './city-hall.repository';
import { MongoPrismaService } from '../services/mongo-prisma.service';
import { CreateCityHallDto } from '@/dto/create-city-hall.dto';

@Injectable()
export class CityHallPrismaRepository implements CityHallRepository {
    constructor(public prisma: MongoPrismaService) {
    }

    async createCityHall({
        name,
        state,
    }: CreateCityHallDto): Promise<any> {
        return await this.prisma.client.cityHall.create({
            data: {
                name,
                state,
            },
        });
    }

    async findCityHallById(id: string): Promise<any> {
        return await this.prisma.client.cityHall.findFirst({
            where: {
                id,
            },
            include: {
                usfs: true,
            }
        });
    }
}
