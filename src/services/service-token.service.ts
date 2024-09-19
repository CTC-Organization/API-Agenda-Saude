import { Injectable } from '@nestjs/common';
import { ServiceTokenRepository } from '../repositories/service-token.repository';
import { CreateServiceTokenDto } from '@/dto/create-service-token.dto';

@Injectable()
export class ServiceTokenService {
    constructor(private servicetokenRepository: ServiceTokenRepository) {}

    async createServiceToken(createServiceTokenDto: CreateServiceTokenDto) {
        try {
            return await this.servicetokenRepository.createServiceToken(createServiceTokenDto);
        } catch (err) {
            throw err;
        }
    }
    async findValidServiceTokenByPatientId(patientId: string) {
        const result = await this.servicetokenRepository.findValidServiceTokenByPatientId(
            patientId,
        );
        return result;
    }
    async findServiceTokenById(serviceTokenId: string) {
        const result = await this.servicetokenRepository.findServiceTokenById(serviceTokenId);
        return result;
    }
    async listServiceTokensByPatientId(patientId: string) {
        const result = await this.servicetokenRepository.listServiceTokensByPatientId(patientId);
        return result;
    }

    async cancelServiceTokenByPatientId(patientId: string) {
        const result = await this.servicetokenRepository.cancelServiceTokenByPatientId(patientId);
        return result;
    }
    async completeServiceTokenByPatientId(patientId: string) {
        const result = await this.servicetokenRepository.completeServiceTokenByPatientId(patientId);
        return result;
    }
}
