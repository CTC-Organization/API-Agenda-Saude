import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestDto } from '@/dto/create-request.dto';
import { RequestRepository } from '@/repositories/request.repository';
import { z } from 'zod';

// export const CreateRequestSchema = z.object({
//     patientId: z.string().length(1, 'É obrigatório o ID de um paciente'),
// });

@Injectable()
export class RequestService {
    constructor(private requestRepository: RequestRepository) {}

    async createRequest(patientId: string) {
        try {
            return await this.requestRepository.createRequest({ patientId });
        } catch (err) {
            throw err;
        }
    }
    async updateRequest(patientId: string) {
        try {
            return await this.requestRepository.updateRequest({ patientId });
        } catch (err) {
            throw err;
        }
    }
    async findRequestById(id: string) {
        const result = await this.requestRepository.findRequestById(id);
        return result;
    }
    async listRequestsByPatientId(id: string) {
        const result = await this.requestRepository.listRequestsByPatientId(id);
        return result;
    }

    async cancelRequest(id: string) {
        const result = await this.requestRepository.cancelRequest(id);
        return result;
    }
    async completeRequest(id: string) {
        const result = await this.requestRepository.completeRequest(id);
        return result;
    }
}
