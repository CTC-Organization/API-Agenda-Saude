import { forwardRef, Module } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { UserPrismaRepository } from '@/repositories/prisma/user-prisma.repository';
import { PrismaService } from '@/services/prisma.service';
import { UserRepository } from '@/repositories/user.repository';
import { AuthModule } from './auth.module';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [UserController],
    providers: [
        PrismaService,
        UserService,
        UserPrismaRepository,
        {
            provide: UserRepository,
            useClass: UserPrismaRepository,
        },
    ],
    exports: [
        UserService,
        UserPrismaRepository,
        {
            provide: UserRepository,
            useClass: UserPrismaRepository,
        },
    ],
})
export class UserModule {}
