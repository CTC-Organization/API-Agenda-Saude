import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateUsfDto {
    @IsNotEmpty()
    @IsString()
    _id: number;

    @IsNotEmpty()
    @IsString()
    nome_oficial: string;

    @IsNotEmpty()
    @IsInt()
    rpa: number;

    @IsNotEmpty()
    @IsInt()
    distrito_sanitario: number;

    @IsNotEmpty()
    @IsNumber()
    microregiao: number;

    @IsNotEmpty()
    @IsInt()
    cnes: number;

    @IsNotEmpty()
    @IsString()
    cod_nat: string;

    @IsNotEmpty()
    @IsString()
    tipo_servico: string;

    @IsNotEmpty()
    @IsString()
    endereco: string;

    @IsNotEmpty()
    @IsString()
    bairro: string;

    @IsNotEmpty()
    @IsString()
    fone: string;

    @IsNotEmpty()
    @IsString()
    servico: string;

    @IsNotEmpty()
    @IsString()
    especialidade: string;

    @IsNotEmpty()
    @IsString()
    como_usar: string;

    @IsNotEmpty()
    @IsString()
    horario: string;

    @IsNotEmpty()
    @IsString()
    ordem: string;

    @IsNotEmpty()
    @IsString()
    latitude: string;

    @IsNotEmpty()
    @IsNumber()
    longitude: number;
}
