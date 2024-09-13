import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { LoginInputDto } from '../dto/login.dto';
import { AuthType } from '@/types/auth.type';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import * as dayjs from 'dayjs';
import { User, UserRole } from '@prisma/postgres-client';
import { PatientService } from './patient.service';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly patientService: PatientService,
        private readonly jwtService: JwtService,
    ) {}

    async login(loginInputDto: LoginInputDto): Promise<AuthType> {
        const { password, email } = loginInputDto;
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) throw new BadRequestException('Seu email e/ou senha estão incorretos!');
        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) throw new BadRequestException('Seu email e/ou senha estão incorretos!');
        const result = await this.createToken(user);
        return result;
    }

    async logout(id: string) {
        try {
            await this.prisma.refreshToken.delete({
                where: {
                    userId: id,
                },
            });

            return { message: 'Usuário deslogado!' };
        } catch (e) {
            throw new BadRequestException('Erro ao deslogar o usuário!');
        }
    }

    

    async createToken(user: User) {
        // COMPLEMENTAR lógica do código comentado ao desenvolver ADMIN e EMPLOYEE
        // if (patient?.role !== UserRole.PATIENT)
        //     throw new BadRequestException('Essa role ainda não foi implementada');
        const expiresInAccessToken = dayjs().add(1, 'days').unix(); // testar refreshtoken e accesstoken
        const patient = await this.patientService.getPatientByEmail(user.email);
        const refreshToken = await this.createRefreshToken(user);
        delete refreshToken.userId;

        const result = {
            id: patient.id,
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            exp: expiresInAccessToken,
            refreshToken: refreshToken.id,
            accessToken: this.jwtService.sign(
                {
                    id: patient.id,
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                {
                    subject: String(patient.id),
                },
            ),
        };
        return result;
    }

    async createRefreshToken(user: User) {
        const expiresInRefreshToken = dayjs().add(7, 'days').unix(); // testar refreshtoken e accesstoken
        await this.deleteRefreshTokenByUserId(user.id); // já apaga sempre que cria
        const generatedRefreshToken = await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                expiresIn: expiresInRefreshToken,
            },
        });
        return generatedRefreshToken;
    }

    checkToken(accessToken: string) {
        try {
            const data = this.jwtService.verify(accessToken);

            return data;
        } catch (e) {
            throw new ForbiddenException('Token expirado e/ou inválido! 1');
        }
    }

    async checkRefreshToken(userId: string, refreshTokenId: string) {
        const refreshToken = await this.getRefreshToken(refreshTokenId);

        const isRefreshTokenExpired = dayjs().isAfter(dayjs.unix(refreshToken.expiresIn));
        if (isRefreshTokenExpired) {
            await this.prisma.refreshToken.delete({
                where: {
                    id: refreshToken.id,
                },
            });
            throw new BadRequestException('Refresh token expirado e/ou inválido! 2');
        }

        const user = await this.prisma.user.findFirst({
            where: {
                id: userId,
            },
        });
        return await this.createToken(user);
    }

    async deleteRefreshTokenByUserId(userId: string) {
        const refreshToken = await this.prisma.refreshToken.findFirst({
            where: {
                userId: userId,
            },
        });

        if (refreshToken) {
            await this.prisma.refreshToken.delete({
                where: {
                    id: refreshToken.id,
                },
            });
        }
    }

    async getRefreshToken(refreshTokenId: string) {
        try {
            const refreshToken = await this.prisma.refreshToken.findFirst({
                where: {
                    id: refreshTokenId,
                },
            });
            if (!refreshToken) throw new BadRequestException('Token inválido e/ou expirado! 3');
            return refreshToken;
        } catch (e) {
            throw new BadRequestException('Token inválido e/ou expirado! 4');
        }
    }
}
