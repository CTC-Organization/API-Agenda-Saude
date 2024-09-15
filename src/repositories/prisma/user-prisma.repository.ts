import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../user.repository';
import { PrismaService } from '@/services/prisma.service';
import { User } from '@prisma/postgres-client';
import { UpdateUserDto } from '@/dto/update-user.dto';
import { CreateUserDto } from '@/dto/create-user.dto';

@Injectable()
export class UserPrismaRepository implements UserRepository {
    constructor(protected readonly prisma: PrismaService) {}

    async createUser({
        email,
        password,
        name,
        phoneNumber,
        role,
        birthDate,
    }: CreateUserDto): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                email,
                password,
                name,
                phoneNumber,
                role,
                birthDate: birthDate ? new Date(birthDate) : undefined,
            },
        });

        delete user.password;

        return user;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: { email },
        });

        if (!user) throw new NotFoundException('Usuário não encontrado');
        delete user.password;

        return user;
    }

    // async findUserByCpf(cpf: string): Promise<User | null> {
    //     const user = await this.prisma.user.findFirst({
    //         where: {
    //             cpf,
    //         },
    //     });
    //     if (!user) throw new NotFoundException('Usuário não encontrado');
    //     delete user.password;
    //     return user;
    // }
    async findUserById(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) throw new NotFoundException('Usuário não encontrado');
        delete user.password;

        return user;
    }

    async updateUser({
        id,
        email,
        password,
        name,
        phoneNumber,
        birthDate,
    }: UpdateUserDto): Promise<User | null> {
        const userData: Partial<User> = {
            email,
            password,
            name,
            phoneNumber,
        };

        if (birthDate) {
            userData.birthDate = new Date(birthDate);
        }

        const result = await this.prisma.user.update({
            where: { id },
            data: userData,
        });

        if (!result) throw new NotFoundException('Usuário não encontrado');
        delete result.password;

        return result;
    }

    // Novo método para atualizar o usuário com o token de recuperação de senha
    async updateUserWithResetToken(
        email: string,
        resetPasswordToken: string,
        resetPasswordExpires: Date,
    ): Promise<User | null> {
        const user = await this.prisma.user.update({
            where: { email },
            data: {
                resetPasswordToken,
                resetPasswordExpires,
            },
        });

        if (!user) throw new NotFoundException('Usuário não encontrado');
        return user;
    }

    // Novo método para encontrar um usuário pelo token de recuperação de senha
    async findUserByResetToken(token: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    gt: new Date(), // Verifica se o token não expirou
                },
            },
        });

        if (!user) throw new NotFoundException('Token inválido ou expirado');
        return user;
    }
}
