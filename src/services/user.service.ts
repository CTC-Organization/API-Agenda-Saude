import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../repositories/user.repository';
import { PrismaService } from './prisma.service'; // Certifique-se de que o caminho está correto
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as dayjs from 'dayjs';
import { excludeFieldsInEntity } from '../utils/exclude-fields';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    constructor(
        private readonly userRepository: UserRepository,
        private readonly prisma: PrismaService, // Injeta o PrismaService aqui
        private readonly mailerService: MailerService,
    ) {}

    async createUser({ email, password, cpf, name, phoneNumber, role, birthDate }: CreateUserDto) {
        if (await this.userRepository.findUserByEmail(email)) {
            throw new BadRequestException('Email indisponível');
        } // else if (await this.userRepository.findUserByCpf(cpf)) {
        //     throw new BadRequestException('CPF indisponível');
        // }

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
    // async getUserByCpf(cpf: string) {
    //     const user = await this.userRepository.findUserByCpf(cpf);
    //     if (!user) throw new NotFoundException('Usuário não encontrado');
    //     excludeFieldsInEntity(user, 'password');
    //     return user;
    // }

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

        this.sendMail(resetToken, email);

        // Aqui você enviaria o token para o email do usuário, mas para fins de exemplo:
        console.log(`Token de recuperação: ${resetToken}`);

        return { message: 'Instruções de recuperação de senha enviadas para o e-mail.' };
    }

    sendMail(token: any, email: any): void {
        this.mailerService
            .sendMail({
                to: email,
                from: 'ctcagendasaude@gmail.com',
                subject: 'Recuperação de Senha',
                text: 'Recuperação',
                html: `<b>Token de recuperação: ${token}</b>`,
            })
            .then(() => {
                console.log('Email enviado com sucesso!');
            })
            .catch((error) => {
                console.error('Erro ao enviar email:', error);
            });
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
