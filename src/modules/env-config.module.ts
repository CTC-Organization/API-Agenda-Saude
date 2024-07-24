import { DynamicModule, Global, Module } from '@nestjs/common';
import { EnvConfigService } from '../services/env-config.service';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { join } from 'node:path';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [EnvConfigService],
    exports: [EnvConfigService],
})
export class EnvConfigModule extends ConfigModule {
    static forRoot(options: ConfigModuleOptions = {}): DynamicModule {
        return super.forRoot({
            ...options,
            envFilePath: [join(__dirname, `../../.env.${process.env.NODE_ENV}`)],
        });
    }
}
