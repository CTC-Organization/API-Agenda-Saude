import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginInputDto } from '../dto/login.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Autenticação: auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post()
    async login(@Body() loginInputDto: LoginInputDto) {
        return await this.authService.login(loginInputDto);
    }
}
