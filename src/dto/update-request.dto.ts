import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateRequestDto {
    @IsUUID()
    @IsNotEmpty()
    patientId: string;
}
