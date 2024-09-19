import { IsEmail, IsString, IsOptional, IsEnum, IsNotEmpty, IsDateString } from 'class-validator';
import { UserRole } from '@prisma/postgres-client';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
    @IsEmail()
    @ApiProperty({
        example: 'Email no formato tadandan@xemail.com',
        description: 'Email único usado pelo paciente',
    })
    email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '11111111111',
        description:
            'CPF do paciente - usado para login. Não precisa estar na formatação exata de CPF por enquanto',
    })
    cpf: string;

    @IsOptional()
    @IsDateString()
    @ApiProperty({
        example: 'data em string 2018-11-17T14:22:29 ou data normal',
        description: 'Data de nascimento',
    })
    birthDate?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '1234',
        description: 'Senha para login',
    })
    password: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: 'Joseth Josépio Resenha',
        description: 'Nome completo do paciente',
    })
    name: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        example: '99999999999',
        description: 'telefone não precisa está no formato correto para fazer requisição',
    })
    phoneNumber: string;

    @IsString()
    @ApiProperty({
        example: '111111111',
        description: 'número do cartão sus- usado para login também.',
    })
    susNumber: string;

    @IsOptional()
    @IsEnum(UserRole)
    @ApiProperty({
        example: 'UserRole.PATIENT: "PATIENT"',
        description: 'Usar apenas paciente por enquanto',
    })
    role: UserRole = UserRole.PATIENT;
}
