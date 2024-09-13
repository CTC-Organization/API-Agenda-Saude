import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LoginInputDto {
    @IsString()
    @ApiProperty({
        example: '11111111111',
        description: 'email do paciente, employee ou admin - usado para login.',
    })
    email: string;

    @IsString()
    @ApiProperty({
        example: '1234',
        description: 'Senha para login',
    })
    password: string;
}
