import { BadRequestException, Injectable } from '@nestjs/common';
import { HealthDistrictRepository } from './health-district.repository';
import { MongoPrismaService } from '../services/mongo-prisma.service';
import { CreateHealthDistrictDto } from '@/dto/create-health-district.dto';
import { EnvConfigService } from '@/services/env-config.service';
import axios from 'axios';
import { removeAccents } from '@/utils/strings';

@Injectable()
export class HealthDistrictPrismaRepository implements HealthDistrictRepository {
    private apiKey: string;
    constructor(
        public prisma: MongoPrismaService,
        public configService: EnvConfigService,
    ) {
        this.apiKey = this.configService.getGoggleMapsApiKey();
    }

    async createHealthDistricts(
        CreateHealthDistrictListDto: Array<CreateHealthDistrictDto>,
    ): Promise<any> {
        const healthDistrictsDataList = CreateHealthDistrictListDto.map(
            (dto: CreateHealthDistrictDto) => {
                if (dto.bairro.toLowerCase() === 'recife') {
                    dto.bairro = 'bairro do recife';
                }
                return {
                    id: dto._id,
                    bairro: dto.bairro.toLowerCase(),
                    distrito_sanitario: dto.distrito_sanitario,
                    descricao_distrito: dto.descricao_distrito,
                };
            },
        );

        try {
            // Inserir registros um por um no MongoDB
            const createdHealthDistricts = [];
            for (const data of healthDistrictsDataList) {
                const createdHealthDistrict = await this.prisma.healthDistrict.create({
                    data,
                });
                createdHealthDistricts.push(createdHealthDistrict);
            }

            return createdHealthDistricts;
        } catch (error) {
            throw new BadRequestException('Falhou ao criar Distritos sanitários');
        }
    }

    async findHealthDistrictByCoordenates({
        latitude,
        longitude,
    }: {
        latitude: string;
        longitude: number;
    }): Promise<any> {
        // busca com api o distrito sanitario baseado na lat e long
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}`;

        try {
            const response = await axios.get(url);
            const results = response.data.results;

            let bairro = '';
            if (results.length > 0) {
                for (const component of results[0].address_components) {
                    if (
                        component.types.includes('sublocality') ||
                        component.types.includes('neighborhood')
                    ) {
                        bairro = removeAccents(component.long_name.toLowerCase());
                    }
                }
            }
            if (bairro !== '') {
                const healthDistrict = await this.prisma.healthDistrict.findFirst({
                    // retorna a linha com o bairro e o distrito
                    where: {
                        bairro,
                    },
                });

                if (healthDistrict) {
                    return healthDistrict;
                } else {
                    throw new Error('Distrito sanitário não encontrado');
                }
            } else {
                throw new Error('Bairro não encontrado');
            }
        } catch (error) {
            console.error('Error fetching data from Google Maps API:', error);
            throw new Error('Erro ao buscar bairro usando coordenadas');
        }
    }
}
