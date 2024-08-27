import { forwardRef, Module } from '@nestjs/common';
import { HealthDistrictController } from '@/controllers/health-district.controller';
import { HealthDistrictService } from '@/services/health-district.service';
import { HealthDistrictRepository } from '@/repositories/health-district.repository';
import { AuthModule } from './auth.module';
import { EnvConfigModule } from './env-config.module';
import { HealthDistrictMongooseRepository } from '@/repositories/mongoose/health-district-mongoose.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthDistrict, HealthDistrictSchema } from '@/models/health-district.model';

@Module({
    imports: [
        forwardRef(() => EnvConfigModule),
        AuthModule,
        MongooseModule.forFeature([{ name: HealthDistrict.name, schema: HealthDistrictSchema }]),
    ],
    controllers: [HealthDistrictController],
    providers: [
        HealthDistrictService,
        HealthDistrictMongooseRepository,
        {
            provide: HealthDistrictRepository,
            useClass: HealthDistrictMongooseRepository,
        },
    ],
    exports: [
        HealthDistrictMongooseRepository,
        {
            provide: HealthDistrictRepository,
            useClass: HealthDistrictMongooseRepository,
        },
    ],
})
export class HealthDistrictModule {}
