import { IsEmail, IsString, IsOptional, IsEnum, IsNotEmpty, IsDateString } from 'class-validator';
import { UserRole } from '@prisma/postgres-client';

export class CreateUserDto {
    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsNotEmpty()
    cpf: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    refreshToken?: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole = UserRole.PATIENT; // default role

    // createdAt and updatedAt are automatically set by Prisma, no need to include them in the DTO
}
