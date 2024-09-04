import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRequestWithoutServiceTokenDto {
    @IsUUID()
    @IsNotEmpty()
    patientId: string;
}
