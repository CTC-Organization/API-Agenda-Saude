import { Test, TestingModule } from '@nestjs/testing';
import { EnvConfigService } from '../services/env-config.service';
import { EnvConfigModule } from '../modules/env-config.module';

describe('EnvConfigService unit tests', () => {
    let sut: EnvConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [EnvConfigModule.forRoot()],
            providers: [EnvConfigService],
        }).compile();

        sut = module.get<EnvConfigService>(EnvConfigService);
    });

    it('should be defined', () => {
        expect(sut).toBeDefined();
    });

    it('should return the variable PORT', () => {
        expect(sut.getAppPort()).toBe(Number(8080));
    });

    it('should return the variable NODE_ENV', () => {
        expect(sut.getNodeEnv()).toBe('test');
    });

    it('database variables shoud be test', () => {
        expect(sut.getDatabase()).toBe('agenda_saude_dev');
    });
});
