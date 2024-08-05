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
        const { cpf, password } = loginInputDto;
        const user = await this.prisma.user.findUnique({
            where: {
                cpf,
            },
        });
        if (!user) throw new BadRequestException('Seu cpf e/ou senha estão incorretos!');
        const isMatch = await argon2.verify(user.password, password);

        if (!isMatch) throw new BadRequestException('Seu cpf e/ou senha estão incorretos!');
        const result = await this.createToken(user);
        return result;
    }

    async createToken(user: User) {
        const expiresInAccessToken = dayjs().add(1, 'd').unix();
        const patient = await this.patientService.getPatientByCpf(user.cpf);
        // if (patient?.role !== UserRole.PATIENT)
        //     throw new BadRequestException('Essa role ainda não foi implementada');

        const result = {
            id: patient?.id,
            userId: user.id,
            name: user?.name,
            role: user.role,
            accessToken: this.jwtService.sign(
                {
                    id: patient.id,
                    userId: user.id,
                    name: user?.name,
                    cpf: user.cpf,
                    role: user.role,
                },
                {
                    subject: String(patient.id),
                },
            ),
            exp: expiresInAccessToken,
        };
        return result;
    }

    checkToken(accessToken: string) {
        try {
            const data = this.jwtService.verify(accessToken);

            return data;
        } catch (e) {
            throw new ForbiddenException('Token expirado e/ou inválido!');
        }
    }
}
