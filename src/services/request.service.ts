import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestDto } from '@/dto/create-request.dto';
import { RequestRepository } from '@/repositories/request.repository';
import { ServiceTokenRepository } from '@/repositories/service-token.repository';
import { PatientRepository } from '@/repositories/patient.repository';
import { UpdateRequestDto } from '@/dto/update-request.dto';
import { ServiceStatus } from '@prisma/postgres-client';

@Injectable()
export class RequestService {
    constructor(
        private requestRepository: RequestRepository,
        private serviceTokenRepository: ServiceTokenRepository,
        private patientRepository: PatientRepository,
    ) {}

    async createRequest(
        files: Array<Express.Multer.File>,
        { date, serviceTokenId, patientId }: CreateRequestDto,
    ) {
        try {
            const serviceToken = await this.serviceTokenRepository.findServiceTokenById(
                serviceTokenId,
            );

            if (!serviceToken) {
                throw new NotFoundException('Ficha de Atendimento não encontrada 1');
            } else if (serviceToken.status !== ServiceStatus.PENDING) {
                throw new BadRequestException('Ficha de Atendimento inválida');
            } else if (!(await this.patientRepository.findPatientById(patientId))) {
                throw new NotFoundException('Paciente não encontrada');
            }
            return await this.requestRepository.createRequest(files, {
                patientId,
                date,
                serviceTokenId,
            });
        } catch (err) {
            throw err;
        }
    }
    async updateRequest(updateRequestDto: UpdateRequestDto) {
        try {
            if (!(await this.patientRepository.findPatientById(updateRequestDto.patientId))) {
                throw new NotFoundException('Paciente não encontrado para essa requisição');
            }
            const result = await this.requestRepository.updateRequest(updateRequestDto);
            if (!result) {
                throw new NotFoundException('Requisição não encontrada para essa atualização');
            }
            return result;
        } catch (err) {
            throw err;
        }
    }
    async findRequestById(id: string) {
        const result = await this.requestRepository.findRequestById(id);
        if (!result) {
            throw new NotFoundException('Requisição não encontrada');
        }
        return result;
    }
    async listRequestsByPatientId(id: string) {
        const result = await this.requestRepository.listRequestsByPatientId(id);
        if (!result) {
            throw new NotFoundException('Nenhuma requisição foi encontrada');
        }
        return result;
    }

    async cancelRequest(id: string) {
        const result = await this.requestRepository.cancelRequest(id);
        if (!result) {
            throw new NotFoundException('Requisição não encontrada');
        }
        return result;
    }
    async completeRequest(id: string) {
        const result = await this.requestRepository.completeRequest(id);
        if (!result) {
            throw new NotFoundException('Requisição não encontrada');
        }
        return result;
    }
}
