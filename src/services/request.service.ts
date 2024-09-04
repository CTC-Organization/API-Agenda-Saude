import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestDto } from '@/dto/create-request.dto';
import { CreateRequestWithoutServiceTokenDto } from '@/dto/create-request-without-service-token.dto';
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

    async createRequestWithoutServiceToken(
        { patientId }: CreateRequestWithoutServiceTokenDto,
        files?: Array<Express.Multer.File>,
    ) {
        try {
            // const serviceToken = await this.serviceTokenRepository.findValidServiceTokenByPatientId(
            //     patientId,
            // );

            // if (!serviceToken) {
            //     throw new NotFoundException(
            //         'O paciente já possui uma ficha de atendimento em andamento',
            //     );
            // } else if (serviceToken.status !== ServiceStatus.PENDING) {
            //     throw new BadRequestException('Ficha de Atendimento inválida');
            // }
            if (!(await this.patientRepository.findPatientById(patientId))) {
                throw new NotFoundException('Paciente não encontrado');
            }
            return await this.requestRepository.createRequestWithoutServiceToken(
                {
                    patientId,
                },
                files,
            );
        } catch (err) {
            throw err;
        }
    }

    async createRequest(
        { date, serviceTokenId, patientId }: CreateRequestDto,
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
                    date,
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
    async confirmRequest(id: string) {
        const result = await this.requestRepository.confirmRequest(id);
        if (!result) {
            throw new NotFoundException('Requisição não encontrada');
        }
        return result;
    }
    async denyRequest(id: string) {
        const result = await this.requestRepository.denyRequest(id);
        if (!result) {
            throw new NotFoundException('Requisição não encontrada');
        }
        return result;
    }
    async acceptRequest(id: string) {
        const result = await this.requestRepository.acceptRequest(id);
        if (!result) {
            throw new NotFoundException('Requisição não encontrada');
        }
        return result;
    }
}
