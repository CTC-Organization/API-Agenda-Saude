import { Injectable } from '@nestjs/common';
import { UsfRepository } from '../repositories/usf.repository';
import { CreateUsfDto } from '@/dto/create-usf.dto';

@Injectable()
export class UsfService {
    constructor(private usfRepository: UsfRepository) {}

    async createUsfList(createUsfListDto: CreateUsfDto[]) {
        try {
            return await this.usfRepository.createUsfList(createUsfListDto);
        } catch (err) {
            throw err;
        }
    }
    async findUsfByCoordenates({ latitude, longitude }: { latitude: string; longitude: number }) {
        const result = await this.usfRepository.findUsfByCoordenates({
            latitude,
            longitude,
        });
        return result;
    }
    async findUsfsByCoordenates({ latitude, longitude }: { latitude: string; longitude: number }) {
        const result = await this.usfRepository.findUsfsByCoordenates({
            latitude,
            longitude,
        });
        return result;
    }

    async listUsfsByHealthDistrict(distrito_sanitario: number): Promise<any> {
        return await this.usfRepository.listUsfsByHealthDistrict(distrito_sanitario);
    }
    async listUsfs(): Promise<any> {
        return await this.usfRepository.listUsfs();
    }
}
