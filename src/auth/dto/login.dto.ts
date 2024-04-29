import { IsString } from 'class-validator';

export class LoginInputDto {
    @IsString()
    email: string;
    @IsString()
    password: string;
}
