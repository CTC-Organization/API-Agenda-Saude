import { IsNotEmpty, IsUUID, IsDateString } from 'class-validator';

export class AcceptRequestDto {
    @IsUUID()
    @IsNotEmpty()
    requestId: string;
    @IsUUID()
    @IsNotEmpty()
    latitude: string;
    @IsUUID()
    @IsNotEmpty()
    longitude: string;
    @IsUUID()
    @IsNotEmpty()
    date: string;
    @IsUUID()
    @IsNotEmpty()
    doctorName: string;
    @IsUUID()
    @IsNotEmpty()
    especiality: string;
}
