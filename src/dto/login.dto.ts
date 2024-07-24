import { IsString } from 'class-validator';

export class LoginInputDto {
    @IsString()
    cpf: string;
    @IsString()
    password: string;
}
