import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginInputDto } from './dto/login.dto';
import { AuthType } from './types/auth.type';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}
    async login(loginDto: LoginInputDto): Promise<AuthType> {
        const user = await this.userService.getUserByEmail(loginDto.email);
        const isMatch = await argon2.verify(user.password, loginDto.password);

        if (!isMatch) throw new BadRequestException('Seu e-mail e/ou senha estão incorretos!');

        try {
            return { id: 'id123', token: 'accesstoken' };
        } catch (error) {
            throw new Error(error);
        }
    }
    async createRefreshToken(user: User) {
        const expiresInRefreshToken = dayjs().add(7, 'days').unix();

        await this.deleteRefreshTokenByUserId(user.id);

        const generatedRefreshToken = await this.prismaService.refreshToken.create({
            data: {
                user_id: user.id,
                expires_in: expiresInRefreshToken,
            },
        });

        return generatedRefreshToken;
    }
    async createToken(user: User) {
        const refreshToken = await this.createRefreshToken(user);
        excludeFieldsInEntity(refreshToken, 'user_id');
        const expiresInAccessToken = dayjs().add(2, 'd').unix();

        return {
            id: user.id,
            name: user.name,
            role: user.role,
            accessToken: this.jwtService.sign(
                {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                {
                    subject: String(user.id),
                    audience: this.audience,
                    issuer: this.issuer,
                },
            ),
            exp: expiresInAccessToken,
            refreshToken: refreshToken.id,
        };
    }

    checkToken(token: string) {
        try {
            const data = this.jwtService.verify(token, {
                audience: this.audience,
                issuer: this.issuer,
            });

            return data;
        } catch (e) {
            throw new ForbiddenException('Token expirado e/ou inválido!');
        }
    }
}
