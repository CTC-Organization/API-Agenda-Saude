import { Injectable } from '@nestjs/common';
import { IEnvInterface } from './env-config.interface';
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
    getDatabaseUrl(): string {
        return this.configService.get<string>('DATABASE_URL');
    }

    getDatabase(): string {
        return this.configService.get<string>('POSTGRES_DB');
    }
}
