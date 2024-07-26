import { Injectable } from '@nestjs/common';
import { IEnvInterface } from '../interfaces/env-config.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvConfigService implements IEnvInterface {
    constructor(private configService: ConfigService) {}

    getAppPort(): number {
        return Number(this.configService.get<number>('PORT'));
    }
    getNodeEnv(): string {
        return this.configService.get<string>('NODE_ENV');
    }

    getDatabase(): string {
        return this.configService.get<string>('POSTGRES_DB');
    }
    getJwtPrivateKey(): string {
        return this.configService.get<string>('JWT_PRIVATE_KEY');
    }

    getJwtPublicKey(): string {
        return this.configService.get<string>('JWT_PUBLIC_KEY');
    }

    getJwtAccessTokenExpiresIn(): string {
        return this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN');
    }
    getGoogleDriveFolderId(): string {
        return this.configService.get<string>('GOOGLE_DRIVE_API_FOLDER_ID');
    }
    getGoogleCloudClientEmail(): string {
        return this.configService.get<string>('GOOGLE_CLOUD_API_CLIENT_EMAIL');
    }
    getGoogleCredentialsJson(): string {
        return this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS_JSON');
    }
}
