import { forwardRef, Module } from '@nestjs/common';
import { UsfController } from '@/controllers/usf.controller';
import { UsfService } from '@/services/usf.service';
import { UsfRepository } from '@/repositories/usf.repository';
import { UsfMongooseRepository } from '@/repositories/mongoose/usf-mongoose.repository';
import { AuthModule } from './auth.module';
import { EnvConfigModule } from './env-config.module';
import { Usf, UsfSchema } from '@/models/usf.model';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthDistrictModule } from './health-district.module';

@Module({
    imports: [
        forwardRef(() => EnvConfigModule),
        AuthModule,
        MongooseModule.forFeature([{ name: Usf.name, schema: UsfSchema }]),
        HealthDistrictModule,
    ],
    controllers: [UsfController],
    providers: [
        UsfService,
        {
            provide: UsfRepository,
            useClass: UsfMongooseRepository,
        },
    ],
    exports: [],
})
export class UsfModule {}
