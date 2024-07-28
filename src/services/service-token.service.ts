import { Injectable } from '@nestjs/common';
import { ServiceTokenRepository } from '../repositories/service-token.repository';

@Injectable()
export class ServiceTokenService {
    constructor(private servicetokenRepository: ServiceTokenRepository) {}

    async createServiceToken(patientId: string) {
        try {
            return await this.servicetokenRepository.createServiceToken({ patientId });
        } catch (err) {
            throw err;
        }
    }
    async findServiceTokenById(id: string) {
        const result = await this.servicetokenRepository.findServiceTokenById(id);
        return result;
    }
    async listServiceTokensByPatientId(id: string) {
        const result = await this.servicetokenRepository.listServiceTokensByPatientId(id);
        return result;
    }

    async cancelServiceToken(id: string) {
        const result = await this.servicetokenRepository.cancelServiceToken(id);
        return result;
    }
    async completeServiceToken(id: string) {
        const result = await this.servicetokenRepository.completeServiceToken(id);
        return result;
    }
}
