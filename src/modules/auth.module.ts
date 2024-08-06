import { Module } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user.module';
import { EnvConfigService } from '../services/env-config.service';
import { PatientModule } from './patient.module';

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
