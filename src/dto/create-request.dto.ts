import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRequestDto {
    @IsUUID()
    @IsNotEmpty()
    patientId: string;
}
