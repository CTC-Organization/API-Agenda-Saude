import { UploadPrismaRepository } from '@/repositories/prisma/upload-prisma.repository';
import { UploadService } from '@/services/upload.service';
import { forwardRef, Global, Module } from '@nestjs/common';
import { UploadController } from '@/controllers/upload.controller';
import { PrismaService } from '@/services/prisma.service';
import { EnvConfigModule } from './env-config.module';
import { UploadRepository } from '@/repositories/upload.repository';
import { AuthModule } from './auth.module';
import { UserModule } from './user.module';

@Module({
    imports: [forwardRef(() => EnvConfigModule), UserModule, forwardRef(() => AuthModule)],
    controllers: [UploadController],
    providers: [
        PrismaService,
        UploadService,
        {
            provide: UploadRepository,
            useClass: UploadPrismaRepository,
        },
        UploadPrismaRepository,
    ],
    exports: [
        UploadService,
        UploadPrismaRepository,
        {
            provide: UploadRepository,
            useClass: UploadPrismaRepository,
        },
    ],
})
export class UploadModule {}
