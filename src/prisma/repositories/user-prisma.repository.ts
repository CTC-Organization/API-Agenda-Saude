import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from '../../user/user.repository';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { excludeFieldsInEntity } from '../../utils/exclude-fields';
import { UpdateUserDto } from '@/user/dto/update-user.dto';

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

        excludeFieldsInEntity(user, 'password');

        return user;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                email,
            },
        });

        if (user) {
            excludeFieldsInEntity(user, 'password');
        }

        return user;
    }

    async findUserByCpf(cpf: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                cpf,
            },
        });

        if (user) {
            excludeFieldsInEntity(user, 'password');
        }

        return user;
    }
    async findUserById(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new BadRequestException('Usuário não encontrado');
        }

        excludeFieldsInEntity(user, 'password');

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

        if (result) {
            excludeFieldsInEntity(result, 'password');
        }

        return result;
    }
}
