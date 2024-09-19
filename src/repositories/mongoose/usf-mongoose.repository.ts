import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UsfRepository } from '../usf.repository';
import { CreateUsfDto } from '@/dto/create-usf.dto';
import { EnvConfigService } from '@/services/env-config.service';
import axios from 'axios';
import { HealthDistrictMongooseRepository } from './health-district-mongoose.repository';
import { findClosestUsf } from '@/utils/geolocalization';
import { removeAccents } from '@/utils/strings';
import { Usf } from '@/models/usf.model';

@Injectable()
export class UsfMongooseRepository implements UsfRepository {
    private googleMapsApiKey: string;

    constructor(
        @InjectModel(Usf.name) private readonly usfModel: Model<Usf>,
        private readonly configService: EnvConfigService,
        private readonly healthDistrictMongooseRepository: HealthDistrictMongooseRepository,
    ) {
        this.googleMapsApiKey = this.configService.getGoggleMapsApiKey();
    }

    // retorna a usf mais próxima em um bairro, sem usfs no bairro retorna a usf mais próxima em um distrito
    async findUsfByCoordenates({
        latitude,
        longitude,
    }: {
        latitude: string;
        longitude: number;
    }): Promise<any> {
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
                const usfs = await this.usfModel.find({ bairro }).exec();

                if (usfs.length === 1) {
                    return usfs[0];
                } else if (usfs.length > 1) {
                    return findClosestUsf(usfs, latitude, longitude);
                } else {
                    const district =
                        await this.healthDistrictMongooseRepository.findHealthDistrictByCoordinates(
                            {
                                latitude,
                                longitude,
                            },
                        );
                    if (district) {
                        const usfsFromDistrict = await this.usfModel
                            .find({ distrito_sanitario: district.distrito_sanitario })
                            .exec();
                        return findClosestUsf(usfsFromDistrict, latitude, longitude);
                    } else {
                        throw new Error('Distrito sanitário não encontrado');
                    }
                }
            } else {
                throw new Error('Distrito sanitário não encontrado');
            }
        } catch (error) {
            console.error('Error fetching data from Google Maps API:', error);
            throw new Error('Erro ao buscar bairro usando coordenadas');
        }
    }

    // retorna as usfs para um bairro caso ache um bairro, senão retornar as usfs de um distrito
    async findUsfsByCoordenates({
        latitude,
        longitude,
    }: {
        latitude: string;
        longitude: number;
    }): Promise<any> {
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
                const usfs = await this.usfModel.find({ bairro }).exec();

                if (usfs.length >= 1) {
                    return usfs;
                } else {
                    const district =
                        await this.healthDistrictMongooseRepository.findHealthDistrictByCoordinates(
                            {
                                latitude,
                                longitude,
                            },
                        );
                    if (district) {
                        const usfsFromDistrict = await this.usfModel
                            .find({ distrito_sanitario: district.distrito_sanitario })
                            .exec();
                        return usfsFromDistrict;
                    } else {
                        throw new Error('Distrito sanitário não encontrado');
                    }
                }
            } else {
                throw new Error('Distrito sanitário não encontrado');
            }
        } catch (error) {
            console.error('Error fetching data from Google Maps API:', error);
            throw new Error('Erro ao buscar bairro usando coordenadas');
        }
    }

    // lista todas as usfs por distrito sanitário
    async listUsfsByHealthDistrict(distrito_sanitario: number): Promise<any> {
        return await this.usfModel.find({ distrito_sanitario }).exec();
    }

    // lista todas as usfs (Recife)
    async listUsfs(): Promise<any> {
        return await this.usfModel.find().exec();
    }

    async createUsfList(createUsfDtoList: Array<CreateUsfDto>): Promise<any> {
        const usfDataList = createUsfDtoList.map((dto) => ({
            id: dto._id,
            nome_oficial: dto.nome_oficial,
            rpa: dto.rpa,
            distrito_sanitario: dto.distrito_sanitario,
            microregiao: dto.microregiao,
            cnes: dto.cnes,
            cod_nat: dto.cod_nat,
            tipo_servico: dto.tipo_servico,
            endereco: dto.endereco,
            bairro: dto.bairro.toLowerCase(),
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
            const result = await this.usfModel.insertMany(usfDataList);
            return result;
        } catch (error) {
            throw new BadRequestException('Falhou ao criar as USFs');
        }
    }
}
