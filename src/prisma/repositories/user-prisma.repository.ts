import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from '../../user/user.repository';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { excludeFieldsInEntity } from '../../utils/exclude-fields';

export type UsersGetInfoDto = Omit<
    User,
    'email' | 'password' | 'collegeId' | 'role' | 'createdAt' | 'updatedAt'
>;

@Injectable()
export class UserPrismaRepository implements UserRepository {
    constructor(private prisma: PrismaService) {}

    async create({ email, password }: CreateUserDto): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                email,
                password,
            },
        });

        excludeFieldsInEntity(user, 'password');

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
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

    async findById(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new BadRequestException('Usuário não encontrado');
        }

        excludeFieldsInEntity(user, 'password');

        return user;
    }
}
