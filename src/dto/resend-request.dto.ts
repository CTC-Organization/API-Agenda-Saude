import { IsNotEmpty, IsUUID, IsDateString } from 'class-validator';

export class ResendRequestDto {
    @IsUUID()
    @IsNotEmpty()
    patientId: string;

    @IsUUID()
    @IsNotEmpty()
    requestId: string;

    @IsNotEmpty()
    specialty: string;
}
