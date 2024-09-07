import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../repositories/user.repository';
import { PrismaService } from './prisma.service'; // Certifique-se de que o caminho está correto
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as dayjs from 'dayjs';
import { excludeFieldsInEntity } from '../utils/exclude-fields';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly prisma: PrismaService, // Injeta o PrismaService aqui
    ) {}

    async createUser({ email, password, cpf, name, phoneNumber, role, birthDate }: CreateUserDto) {
        if (await this.userRepository.findUserByEmail(email)) {
            throw new BadRequestException('Email indisponível');
        } else if (await this.userRepository.findUserByCpf(cpf)) {
            throw new BadRequestException('CPF indisponível');
        }

        const passwordHashed = await argon2.hash(password);
        const user = await this.userRepository.createUser({
            cpf,
            email,
            password: passwordHashed,
            name,
            phoneNumber,
            role,
            birthDate,
        });

        excludeFieldsInEntity(user, 'password');

        return user;
    }

    async getUserById(id: string) {
        const user = await this.userRepository.findUserById(id);
        if (!user) throw new NotFoundException('Usuário não encontrado');
        excludeFieldsInEntity(user, 'password');
        return user;
    }
    async getUserByCpf(cpf: string) {
        const user = await this.userRepository.findUserByCpf(cpf);
        if (!user) throw new NotFoundException('Usuário não encontrado');
        excludeFieldsInEntity(user, 'password');
        return user;
    }

    async requestPasswordReset(email: string) {
        const user = await this.userRepository.findUserByEmail(email);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpires = dayjs().add(1, 'hour').toDate(); // Token válido por 1 hora

        await this.prisma.user.update({
            where: { email },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires,
            },
        });

        // Aqui você enviaria o token para o email do usuário, mas para fins de exemplo:
        console.log(`Token de recuperação: ${resetToken}`);

        return { message: 'Instruções de recuperação de senha enviadas para o e-mail.' };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() }, // Verifica se o token não expirou
            },
        });

        if (!user) {
            throw new BadRequestException('Token inválido ou expirado');
        }

        const hashedPassword = await argon2.hash(newPassword);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });

        return { message: 'Senha alterada com sucesso!' };
    }
}
