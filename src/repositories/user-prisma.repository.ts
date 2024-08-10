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
        birthDate,
    }: CreateUserDto): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                email,
                password,
                cpf,
                name,
                phoneNumber,
                role,
                birthDate: new Date(birthDate),
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
        if (!user) throw new NotFoundException('Usuário não encontrado');
        delete user.password;

        return user;
    }

    async findUserByCpf(cpf: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                cpf,
            },
        });
        if (!user) throw new NotFoundException('Usuário não encontrado');
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
        const userData: any = {
            email,
            password,
            name,
            phoneNumber,
        };

        if (!!birthDate) {
            userData.birthDate = new Date(birthDate);
        }
        const result = await this.prisma.user.update({
            where: {
                id,
            },
            data: userData,
        });
        if (!result) {
            throw new NotFoundException('Usuário não encontrado');
        }

        delete result.password;

        return result;
    }
}
