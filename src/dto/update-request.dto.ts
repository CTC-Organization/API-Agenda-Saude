import { IsNotEmpty, IsUUID, IsDateString } from 'class-validator';

export class UpdateRequestDto {
    @IsNotEmpty()
    @IsDateString()
    date?: string;

    @IsUUID()
    @IsNotEmpty()
    patientId: string;

    @IsUUID()
    @IsNotEmpty()
    requestId: string;
}
