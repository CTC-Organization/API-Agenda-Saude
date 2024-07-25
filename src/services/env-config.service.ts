import { Injectable } from '@nestjs/common';
import { IEnvInterface } from '../interfaces/env-config.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvConfigService implements IEnvInterface {
    constructor(private configService: ConfigService) {}

    getAppPort(): number {
        return Number(this.configService.getOrThrow<number>('PORT'));
    }
    getNodeEnv(): string {
        return this.configService.getOrThrow<string>('NODE_ENV');
    }

    getDatabase(): string {
        return this.configService.getOrThrow<string>('POSTGRES_DB');
    }
    getJwtPrivateKey(): string {
        return this.configService.getOrThrow<string>('JWT_PRIVATE_KEY');
    }

    getJwtPublicKey(): string {
        return this.configService.getOrThrow<string>('JWT_PUBLIC_KEY');
    }

    getJwtAccessTokenExpiresIn(): string {
        return this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRES_IN');
    }

    getAwsEndpoint(): string{
        return this.configService.getOrThrow<string>('AWS_ENDPOINT');
    }

    getAwsS3Region(): string {
        return this.configService.getOrThrow<string>('AWS_S3_REGION');
    }

    getAwsAccessKeyId(): string {
        return this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
    }
    
    getAwsSecretAccessKey(): string{
        return this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY');
    }

    getAwsBucket(): string{
        return this.configService.getOrThrow<string>('AWS_BUCKET');
    }

    
    
}
