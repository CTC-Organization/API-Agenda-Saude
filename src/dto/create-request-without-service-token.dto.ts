import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateRequestWithoutServiceTokenDto {
    @IsUUID()
    @IsNotEmpty()
    patientId: string;

    @IsNotEmpty()
    @IsString()
    specialty: string;
}
