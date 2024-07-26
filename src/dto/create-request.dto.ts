import { IsNotEmpty, IsUUID, IsDateString } from 'class-validator';

export class CreateRequestDto {
    @IsUUID()
    @IsNotEmpty()
    serviceTokenId: string;

    @IsUUID()
    @IsNotEmpty()
    patientId: string;

    @IsNotEmpty()
    readonly files: Array<Express.Multer.File>;

    @IsNotEmpty()
    @IsDateString()
    date: string;
}
