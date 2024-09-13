import { UserRole } from '@prisma/postgres-client';

export interface CreatePatient {
    cpf: string;
    password: string;
    email: string;
    name?: string;
    phoneNumber?: string;
    role?: UserRole;
    birthDate?: string;
    susNumber: string;
}

export interface Patient {
    id: string;
    // cpf: string;
    email: string;
    name?: string;
    phoneNumber?: string;
    role: UserRole;
    susNumber?: string;
    birthDate?: Date;
}
