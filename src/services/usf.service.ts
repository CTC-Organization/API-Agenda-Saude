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
    async listByCityHallId(usfId: string) {
        const result = await this.usfRepository.listByCityHallId(usfId);
        return result;
    }
}
