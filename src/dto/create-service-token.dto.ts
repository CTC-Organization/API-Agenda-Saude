import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateServiceTokenDto {
    @IsUUID()
    @IsNotEmpty()
    patientId: string;
}
