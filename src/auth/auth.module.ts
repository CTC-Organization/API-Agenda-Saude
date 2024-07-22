import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '@/user/user.module';
import { EnvConfigService } from '@/config/env-config.service';
import { PatientModule } from '@/patient/patient.module';

@Module({
    imports: [
        UserModule,
        PatientModule,
        JwtModule.registerAsync({
            useFactory: async (configService: EnvConfigService) => {
                const privateKey = configService.getJwtPrivateKey();
                const publicKey = configService.getJwtPublicKey();
                return {
                    global: true,
                    privateKey: Buffer.from(privateKey, 'base64'),
                    publicKey: Buffer.from(publicKey, 'base64'),
                    signOptions: {
                        expiresIn: configService.getJwtAccessTokenExpiresIn(),
                        algorithm: 'RS256',
                    },
                };
            },
            inject: [EnvConfigService],
        }),
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
