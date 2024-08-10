import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginInputDto {
    @IsString()
    @ApiProperty({
        example: '11111111111',
        description:
            'CPF do paciente - usado para login. Não precisa estar na formatação exata de CPF por enquanto',
    })
    cpf: string;
    @IsString()
    @ApiProperty({
        example: '1234',
        description: 'Senha para login',
    })
    password: string;
}
