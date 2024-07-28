import { Module } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { UserPrismaRepository } from '@/repositories/user-prisma.repository';
import { PrismaService } from '@/services/prisma.service';
import { UserRepository } from '@/repositories/user.repository';

@Module({
    controllers: [UserController],
    providers: [
        PrismaService,
        UserService,
        {
            provide: UserRepository,
            useClass: UserPrismaRepository,
        },
    ],
    exports: [UserService],
})
export class UserModule {}
