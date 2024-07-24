import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceTokenDto } from '../dto/create-service-token.dto';
import { ServiceTokenRepository } from '../repositories/service-token.repository';
import { z } from 'zod';

// export const CreateServiceTokenSchema = z.object({
//     patientId: z.string().length(1, 'É obrigatório o ID de um paciente'),
// });

@Injectable()
export class ServiceTokenService {
    constructor(private servicetokenRepository: ServiceTokenRepository) {}

    async createServiceToken(patientId: string) {
        try {
            // CreateServiceTokenSchema.parse(data);
            // const { patientId } = data;

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
