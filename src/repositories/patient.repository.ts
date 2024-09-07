import { CreatePatientDto } from '@/dto/create-patient.dto';
import { UpdatePatientDto } from '@/dto/update-patient.dto';
import { Patient } from '../interfaces/patient';

export abstract class PatientRepository {
    abstract createPatient(patient: CreatePatientDto): Promise<Patient | null>;
    abstract findPatientById(id: string): Promise<any>;
    abstract findPatientByEmail(email: string): Promise<Patient | null>;
    abstract findPatientBySusNumber(susNumber: string): Promise<any>;

    // abstract findPatientByCpf(cpf: string): Promise<Patient | null>;
    abstract updatePatient(
        id: string,
        patient: UpdatePatientDto,
        file?: Express.Multer.File,
    ): Promise<Patient | null>;
}
