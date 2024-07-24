import { Module } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { UserPrismaRepository } from '@/repositories/user-prisma.repository';

@Module({
    controllers: [UserController],
    providers: [UserService, UserPrismaRepository],
    exports: [UserService],
})
export class UserModule {}
