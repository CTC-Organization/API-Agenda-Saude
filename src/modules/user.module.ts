import { forwardRef, Module } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { UserPrismaRepository } from '@/repositories/prisma/user-prisma.repository';
import { PrismaService } from '@/services/prisma.service';
import { UserRepository } from '@/repositories/user.repository';
import { AuthModule } from './auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

@Module({
    imports: [
        forwardRef(() => AuthModule),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                transport: {
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: config.get('EMAIL_USER'),
                        clientId: config.get('GOOGLE_CLIENT_ID'),
                        clientSecret: config.get('GOOGLE_CLIENT_SECRET'),
                        accessToken: config.get('GOOGLE_ACCESS_TOKEN'),
                    },
                },
                defaults: {
                    from: `"No Reply" <${config.get('ctcagendasaude@gmail.com')}>`,
                },
                template: {
                    dir: path.join(__dirname, './templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
        }),
    ],
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
