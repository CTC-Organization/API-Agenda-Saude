import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientRepository } from './patient.repository';
import { hash } from 'bcryptjs';
import { excludeFieldsInEntity } from '../utils/exclude-fields';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const CreatePatientSchema = z.object({
    cpf: z.string().length(1, 'CPF deve ter 11 caracteres'),
    password: z.string().min(1, 'A senha deve ter pelo menos 6 caracteres'),
    email: z.string().email('Email inválido').optional(),
    name: z.string().min(1, 'O nome é obrigatório').optional(),
    phoneNumber: z.string().min(1, 'O telefone deve ter pelo menos 10 caracteres').optional(),
    role: z
        .nativeEnum(UserRole, {
            errorMap: () => ({
                message: 'Papel do paciente inválido.',
            }),
        })
        .optional(),
});

// export type createPatientSchema = z.infer<typeof CreatePatientSchema>;

@Injectable()
export class PatientService {
    constructor(private patientRepository: PatientRepository) {}

    async createPatient(data: CreatePatientDto) {
        CreatePatientSchema.safeParse(data);
        const { cpf, password, email, phoneNumber, role, name } = data;

        if (!!email) {
            const result = await this.patientRepository.findPatientByEmail(email);
            if (!!result) throw new BadRequestException('Email indisponível');
        }
        if (await this.patientRepository.findPatientByCpf(cpf)) {
            throw new BadRequestException('CPF indisponível');
        }
        const passwordHashed = await hash(password, 10);
        const result = await this.patientRepository.createPatient({
            cpf,
            email,
            password: passwordHashed,
            name,
            phoneNumber,
            role,
        });

        if (result) {
            excludeFieldsInEntity(result, 'password');
            excludeFieldsInEntity(result, 'id');
        }

        return result;
    }

    async getPatientById(id: string) {
        const result = await this.patientRepository.findPatientById(id);
        if (!!result) {
            excludeFieldsInEntity(result, 'password');
            excludeFieldsInEntity(result, 'id');
        } else {
            throw new NotFoundException('Paciente não encontrado');
        }
        return result;
    }
    async getPatientByEmail(email: string) {
        const result = await this.patientRepository.findPatientByEmail(email);
        if (!!result) {
            excludeFieldsInEntity(result, 'password');
            excludeFieldsInEntity(result, 'id');
        } else {
            throw new NotFoundException('Paciente não encontrado');
        }
        return result;
    }
    async getPatientByCpf(cpf: string) {
        const result = await this.patientRepository.findPatientByCpf(cpf);
        if (!!result) {
            excludeFieldsInEntity(result, 'password');
            excludeFieldsInEntity(result, 'id');
        } else {
            throw new NotFoundException('Paciente não encontrado');
        }
        return result;
    }
    async updatePatient(updatePatientDto: UpdatePatientDto) {
        const result = await this.patientRepository.updatePatient(updatePatientDto);
        if (!!result) {
            excludeFieldsInEntity(result, 'password');
            excludeFieldsInEntity(result, 'id');
        } else {
            throw new NotFoundException('Paciente atualizado não encontrado');
        }
        return result;
    }
}
