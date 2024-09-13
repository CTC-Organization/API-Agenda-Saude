import { IsNotEmpty, IsUUID, IsDateString } from 'class-validator';

export class AcceptRequestDto {
    @IsNotEmpty()
    latitude: string;

    @IsNotEmpty()
    longitude: string;

    @IsNotEmpty()
    date: string;

    @IsNotEmpty()
    doctorName: string;
}
