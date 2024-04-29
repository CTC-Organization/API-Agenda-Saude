import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserRepository } from 'src/user/user.repository';
import { UserPrismaRepository } from './repositories/user-prisma.repository';
@Global()
@Module({
    providers: [
        PrismaService,
        {
            provide: UserRepository,
            useClass: UserPrismaRepository,
        },
    ],
    exports: [UserRepository, PrismaService],
})
export class DatabaseModule {}
