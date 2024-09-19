import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestDto } from '@/dto/create-request.dto';
import { CreateRequestWithoutServiceTokenDto } from '@/dto/create-request-without-service-token.dto';
import { RequestRepository } from '@/repositories/request.repository';
import { ServiceTokenRepository } from '@/repositories/service-token.repository';
import { PatientRepository } from '@/repositories/patient.repository';
import { ServiceStatus } from '@prisma/postgres-client';
import { ResendRequestDto } from '@/dto/resend-request.dto';
import { AcceptRequestDto } from '@/dto/accept-request.dto';

@Injectable()
export class RequestService {
    constructor(
        private requestRepository: RequestRepository,
        private serviceTokenRepository: ServiceTokenRepository,
        private patientRepository: PatientRepository,
    ) {}

    async createRequestWithoutServiceToken(
        { patientId, specialty }: CreateRequestWithoutServiceTokenDto,
        files?: Array<Express.Multer.File>,
    ) {
        try {
            if (!(await this.patientRepository.findPatientById(patientId))) {
                throw new NotFoundException('Paciente não encontrado');
            }
            return await this.requestRepository.createRequestWithoutServiceToken(
                {
                    patientId,
                    specialty,
                },
                files,
            );
        } catch (err) {
            throw err;
        }
    }

    async createRequest(
        { serviceTokenId, patientId, specialty }: CreateRequestDto,
        files?: Array<Express.Multer.File>,
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
            return await this.requestRepository.createRequest(
                {
                    patientId,
                    specialty,
                    serviceTokenId,
                },
                files,
            );
        } catch (err) {
            throw err;
        }
    }
    async listAllRequests() {
        return await this.requestRepository.listAllRequests();
    }
    async resendRequest(resendRequestDto: ResendRequestDto, files?: Array<Express.Multer.File>) {
        try {
            if (!(await this.patientRepository.findPatientById(resendRequestDto.patientId))) {
                throw new NotFoundException('Paciente não encontrado para essa requisição');
            }
            const result = await this.requestRepository.resendRequest(resendRequestDto, files);
            if (!result) {
                throw new NotFoundException('O reenvio falhou');
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
    async confirmRequest(id: string) {
        const result = await this.requestRepository.confirmRequest(id);
        if (!result) {
            throw new NotFoundException('Requisição não encontrada');
        }
        return result;
    }
    async denyRequest(id: string, observation: string) {
        const result = await this.requestRepository.denyRequest(id, observation);
        if (!result) {
            throw new NotFoundException('Requisição não encontrada');
        }
        return result;
    }
    async acceptRequest(requestId: string, acceptRequestDto: AcceptRequestDto) {
        const result = await this.requestRepository.acceptRequest(requestId, acceptRequestDto);
        if (!result) {
            throw new NotFoundException('Requisição não encontrada');
        }
        return result;
    }
}
