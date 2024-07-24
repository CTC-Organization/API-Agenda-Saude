import { CreatePatientDto } from '@/dto/create-patient.dto';
import { UserRepository } from './user.repository';
import { UpdatePatientDto } from '@/dto/update-patient.dto';
import { CreatePatient, Patient } from '../interfaces/patient';

export abstract class PatientRepository {
    abstract createPatient(patient: CreatePatientDto): Promise<Patient | null>;
    abstract findPatientById(id: string): Promise<Patient | null>;
    abstract findPatientByEmail(email: string): Promise<Patient | null>;
    abstract findPatientByCpf(cpf: string): Promise<Patient | null>;
    abstract updatePatient(id: string, patient: UpdatePatientDto): Promise<Patient | null>;
}
