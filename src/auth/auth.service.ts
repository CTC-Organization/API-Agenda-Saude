import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginInputDto } from './dto/login.dto';
import { AuthType } from './types/auth.type';
import { UserService } from '@/user/user.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import * as dayjs from 'dayjs';
import { User, UserRole } from '@prisma/client';
import { PatientService } from '@/patient/patient.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly patientService: PatientService,
        private readonly jwtService: JwtService,
    ) {}

    async login(loginInputDto: LoginInputDto): Promise<AuthType> {
        const { cpf, password } = loginInputDto;
        const user = await this.userService.getUserByCpf(cpf);

        const isMatch = await argon2.verify(user.password, loginInputDto.password);

        if (!isMatch) throw new BadRequestException('Seu cpf e/ou senha estão incorretos!');

        const result = await this.createToken(user);
        return result;
    }

    async createToken(user: User) {
        //const refreshToken = await this.createRefreshToken(user);
        //excludeFieldsInEntity(refreshToken, 'user_id');
        const expiresInAccessToken = dayjs().add(1, 'd').unix();
        const patient = await this.patientService.getPatientByCpf(user.cpf);
        const result = {
            id: !!patient?.id ? patient.id : user.id,
            name: user?.name,
            role: user.role,
            accessToken: this.jwtService.sign(
                {
                    id: !!patient?.id ? patient.id : user.id,
                    name: user?.name,
                    cpf: user.cpf,
                    role: user.role,
                },
                {
                    subject: String(!!patient?.id ? patient.id : user.id),
                },
            ),
            exp: expiresInAccessToken,
        };
        return result;
    }
}
