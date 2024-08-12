import { BadRequestException, Injectable } from '@nestjs/common';
import { MongoPrismaService } from '../services/mongo-prisma.service';
import { UsfRepository } from './usf.repository';
import { CreateUsfDto } from '@/dto/create-usf.dto';
import { EnvConfigService } from '@/services/env-config.service';
import axios from 'axios';
import { HealthDistrictPrismaRepository } from './health-district-prisma.repository';
import { findClosestUsf } from '@/utils/geolocalization';
import { removeAccents } from '@/utils/strings';

@Injectable()
export class UsfPrismaRepository implements UsfRepository {
    private apiKey: string;
    constructor(
        private prisma: MongoPrismaService,
        private configService: EnvConfigService,
        private healthDistrictPrismaRepository: HealthDistrictPrismaRepository,
    ) {
        this.apiKey = this.configService.getGoggleMapsApiKey();
    }
    async findUsfByCoordenates({
        latitude,
        longitude,
    }: {
        latitude: string;
        longitude: number;
    }): Promise<any> {
        // buscar posto (usf) baseado em lat e long enviado
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}`;
        // lat e long pertence a um bairro no geocoding
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
                const usfs = await this.prisma.usf.findMany({
                    where: {
                        bairro,
                    },
                });
                ////////// se o bairro do usuario possui uma ou mais usfs para o bairro:
                // se só tem uma usf retorna apenas essa usf
                if (usfs?.length == 1) return usfs[0];
                else if (usfs?.length > 1) {
                    // caso mais de 1, verificar usf mais próxima a lat e long dentro da lista de ufs para esse bairro
                    return findClosestUsf(usfs, latitude, longitude);
                    // retorne usf com latitude e longitude matematicamente mais proxima da input latitude, longitude
                } else if (usfs?.length === 0) {
                    // nenhum usf achado
                    const district =
                        await this.healthDistrictPrismaRepository.findHealthDistrictByCoordenates({
                            latitude,
                            longitude,
                        });
                    if (!!district) {
                        ////////// caso não tenha nenhuma usf no bairro específico então:
                        // achar o distrito baseado no bairro
                        // buscar posto de saúde mais próximo dentro dos usfs do mesmo distrito baseado na lat e long
                        const usfsFromDistrict = await this.prisma.usf.findMany({
                            where: {
                                distrito_sanitario: district.distrito_sanitario,
                            },
                        });
                        // retorne usf dentro de usfsFromDistrict matematicamente mais proximo em latitude(string) e longitude(number) da input latitude, longitude
                        return findClosestUsf(usfsFromDistrict, latitude, longitude);
                        // retornar usf mais proximo
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
    async listUsfsByHealthDistrict(distrito_sanitario: number): Promise<any> {
        return await this.prisma.usf.findMany({
            where: {
                distrito_sanitario,
            },
        });
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
            const createdUsfs = [];
            for (const data of usfDataList) {
                const createdUsf = await this.prisma.usf.create({
                    data,
                });
                createdUsfs.push(createdUsf);
            }

            return createdUsfs;
        } catch (error) {
            throw new BadRequestException('Falhou ao criar as USFs');
        }
    }
}
