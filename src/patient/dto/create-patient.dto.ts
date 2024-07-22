import { IsEmail, IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreatePatientDto {
    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    cpf: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    phoneNumber: string;

    @IsEnum(UserRole)
    @IsOptional()
    role: UserRole = UserRole.PATIENT; // default role
}
