import { IsOptional, IsEmail, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class UpdatePatientDto {
    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
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
    @IsDateString()
    birthDate: string;

    @IsOptional()
    @IsString()
    susNumber: string;

    @IsOptional()
    @IsString()
    avatar: string;
}
