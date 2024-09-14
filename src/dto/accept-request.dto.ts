import { IsNotEmpty, IsUUID, IsDateString, IsString } from 'class-validator';

export class AcceptRequestDto {
    @IsNotEmpty()
    @IsString()
    latitude: string;

    @IsNotEmpty()
    @IsString()
    longitude: string;

    @IsNotEmpty()
    @IsDateString()
    date: string;

    @IsNotEmpty()
    @IsString()
    doctorName: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    unitName: string;
}
