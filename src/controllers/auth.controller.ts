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

    @Post('refresh-token')
    async refreshToken(
        @Body() { id, refreshToken }: { id: string; refreshToken: string },
        @Req() request: Request,
    ) {
        return await this.authService.checkRefreshToken(id, refreshToken);
    }

    @UseGuards(ValidateIsUserSelfOrAdmin)
    @Get('logout/:id')
    async logout(@Param('id') id: string) {
        return await this.authService.logout(id);
    }
}
