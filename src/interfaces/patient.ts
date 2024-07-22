import { UserRole } from '@prisma/client';

export interface CreatePatient {
    cpf: string;
    password: string;
    email?: string;
    name?: string;
    phoneNumber?: string;
    role?: UserRole;
}

export interface Patient {
    id: string;
    cpf: string;
    email?: string;
    name?: string;
    phoneNumber?: string;
    role: UserRole;
}
