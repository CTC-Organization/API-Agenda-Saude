import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateHealthDistrictDto {
    @IsInt()
    _id: number;

    @IsNotEmpty()
    @IsString()
    bairro: string;

    @IsInt()
    distrito_sanitario: number;

    @IsString()
    descricao_distrito: string;
}
