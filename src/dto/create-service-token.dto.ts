import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateServiceTokenDto {
    @IsUUID()
    @IsNotEmpty()
    patientId: string;

    @IsNotEmpty()
    @IsDateString()
    expirationDate: string;
}
