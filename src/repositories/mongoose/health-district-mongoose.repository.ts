import { BadRequestException, Injectable } from '@nestjs/common';
import { HealthDistrictRepository } from '../health-district.repository';
import { HealthDistrict } from '@/models/health-district.model';
import { CreateHealthDistrictDto } from '@/dto/create-health-district.dto';
import { EnvConfigService } from '@/services/env-config.service';
import axios from 'axios';
import { removeAccents } from '@/utils/strings';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class HealthDistrictMongooseRepository implements HealthDistrictRepository {
    private googleMapsApiKey: string;
    constructor(
        @InjectModel(HealthDistrict.name)
        private readonly healthDistrictModel: Model<HealthDistrict>, // Injeção do modelo Mongoose
        private readonly configService: EnvConfigService,
    ) {
        this.googleMapsApiKey = this.configService.getGoggleMapsApiKey();
    }

    async createHealthDistricts(
        createHealthDistrictListDto: Array<CreateHealthDistrictDto>,
    ): Promise<any> {
        const healthDistrictsDataList = createHealthDistrictListDto.map((dto) => {
            if (dto.bairro.toLowerCase() === 'recife') {
                dto.bairro = 'bairro do recife';
            }
            return {
                id: dto._id, // Mongoose usa `_id` como identificador
                bairro: dto.bairro.toLowerCase(),
                distrito_sanitario: dto.distrito_sanitario,
                descricao_distrito: dto.descricao_distrito,
            };
        });
        try {
            const result = await this.healthDistrictModel.insertMany(healthDistrictsDataList);

            return result;
        } catch (error) {
            throw new BadRequestException('Falhou ao criar Distritos sanitários');
        }
    }

    async findHealthDistrictByCoordinates({
        latitude,
        longitude,
    }: {
        latitude: string;
        longitude: number;
    }): Promise<any> {
        // busca com api o distrito sanitário baseado na lat e long
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.googleMapsApiKey}`;

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
                const healthDistrict = await this.healthDistrictModel.findOne({
                    bairro,
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
