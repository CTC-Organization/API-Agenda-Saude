import { AttachmentPrismaRepository } from '@/repositories/attachment-prisma.repository';
import { AttachmentService } from '@/services/attachment.service';
import { forwardRef, Global, Module } from '@nestjs/common';
import { RequestModule } from './request.module';
import { AttachmentController } from '@/controllers/attachment.controller';
import { PrismaService } from '@/services/prisma.service';
import { EnvConfigModule } from './env-config.module';
import { AttachmentRepository } from '@/repositories/attachment.repository';
import { ServiceTokenModule } from './service-token.module';
import { AuthModule } from './auth.module';

@Global()
@Module({
    imports: [
        AuthModule,
        forwardRef(() => EnvConfigModule), // Importa EnvConfigModule se necessário para configurar o envConfigService
        ServiceTokenModule,
        forwardRef(() => RequestModule), // Usar forwardRef para resolver dependência circular
    ],
    controllers: [AttachmentController],
    providers: [
        PrismaService,
        AttachmentService,
        {
            provide: AttachmentRepository,
            useClass: AttachmentPrismaRepository,
        },
        AttachmentPrismaRepository,
    ],
    exports: [
        AttachmentService,
        AttachmentPrismaRepository,
        {
            provide: AttachmentRepository,
            useClass: AttachmentPrismaRepository,
        },
    ],
})
export class AttachmentModule {}
