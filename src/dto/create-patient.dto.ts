import { IsEmail, IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreatePatientDto {
    @IsOptional()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    cpf: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    phoneNumber: string;

    @IsOptional()
    @IsEnum(UserRole)
    role: UserRole = UserRole.PATIENT; // default role
}
