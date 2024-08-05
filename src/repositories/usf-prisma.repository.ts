import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CityHallRepository } from './city-hall.repository';
import { MongoPrismaService } from '../services/mongo-prisma.service';
import { CreateCityHallDto } from '@/dto/create-city-hall.dto';
import { UsfRepository } from './usf.repository';
import { CreateUsfDto } from '@/dto/create-usf.dto';

@Injectable()
export class UsfPrismaRepository implements UsfRepository {
    constructor(public prisma: MongoPrismaService) {
    }
    async createUsfList(createUsfDtoList: Array<CreateUsfDto>): Promise<any> {
        const usfDataList = createUsfDtoList.map((dto) => ({
            usfId: dto._id,
            nome_oficial: dto.nome_oficial,
            cityHallId: dto.cityHallId,
            rpa: dto.rpa,
            distrito_sanitario: dto.distrito_sanitario,
            microregiao: dto.microregiao,
            cnes: dto.cnes,
            cod_nat: dto.cod_nat,
            tipo_servico: dto.tipo_servico,
            endereco: dto.endereco,
            bairro: dto.bairro,
            fone: dto.fone,
            servico: dto.servico,
            especialidade: dto.especialidade,
            como_usar: dto.como_usar,
            horario: dto.horario,
            ordem: dto.ordem,
            latitude: dto.latitude,
            longitude: dto.longitude,
          }));

          try {
            // Criar múltiplos registros no MongoDB
            const createdUsfs = await this.prisma.client.usf.createMany({
              data: usfDataList,
            });
      
            return createdUsfs;
          } catch (error) {
            throw new BadRequestException('Failed to create USFs');
          }
    }
    findAll(): Promise<any> {
        throw new Error('Method not implemented.');
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
