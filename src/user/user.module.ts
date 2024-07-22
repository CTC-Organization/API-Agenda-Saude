import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserPrismaRepository } from '@/prisma/repositories/user-prisma.repository';

@Module({
    controllers: [UserController],
    providers: [UserService, UserPrismaRepository],
    exports: [UserService],
})
export class UserModule {}
