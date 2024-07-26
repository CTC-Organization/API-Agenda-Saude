import { IsNotEmpty, IsUUID, IsDateString, IsString } from 'class-validator';

export class CreateRequestDto {
    @IsUUID()
    @IsNotEmpty()
    serviceTokenId: string;

    @IsUUID()
    @IsNotEmpty()
    patientId: string;

    @IsNotEmpty()
    @IsDateString()
    date: string;
}
