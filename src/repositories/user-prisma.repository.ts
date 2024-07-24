import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { PrismaService } from '@/services/prisma.service';
import { User } from '@prisma/client';
import { UpdateUserDto } from '@/dto/update-user.dto';
import { CreateUserDto } from '@/dto/create-user.dto';

@Injectable()
export class UserPrismaRepository implements UserRepository {
    constructor(public prisma: PrismaService) {}

    async createUser({
        email,
        password,
        cpf,
        name,
        phoneNumber,
        role,
    }: CreateUserDto): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                email,
                password,
                cpf,
                name,
                phoneNumber,
                role,
            },
        });

        delete user.password;

        return user;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                email,
            },
        });
        delete user.password;

        return user;
    }

    async findUserByCpf(cpf: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                cpf,
            },
        });
        delete user.password;
        return user;
    }
    async findUserById(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }
        delete user.password;
        return user;
    }
    async updateUser({
        id,
        email,
        password,
        cpf,
        name,
        phoneNumber,
        role,
    }: UpdateUserDto): Promise<User | null> {
        const result = await this.prisma.user.update({
            where: {
                id,
            },
            data: {
                email,
                password,
                cpf,
                name,
                phoneNumber,
                role,
            },
        });
        if (!result) {
            throw new NotFoundException('Usuário não encontrado');
        }

        delete result.password;

        return result;
    }
}
