import { Controller, Post, Body, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginInputDto } from '../dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { ValidateIsUserSelfOrAdmin } from '@/commons/guards/validate-self-or-admin.guard';

@ApiTags('Autenticação: auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginInputDto: LoginInputDto) {
        return await this.authService.login(loginInputDto);
    }

    @Post('refresh-token/:id')
    async refreshToken(
        @Param('id') userId: string,
        @Body() { refreshToken }: { refreshToken: string },
    ) {
        return await this.authService.checkRefreshToken(userId, refreshToken);
    }

    @UseGuards(ValidateIsUserSelfOrAdmin)
    @Post('logout/:id')
    async logout(@Param('id') id: string) {
        return await this.authService.logout(id);
    }
}
