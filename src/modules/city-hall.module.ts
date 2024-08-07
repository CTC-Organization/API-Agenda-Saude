import { forwardRef, Module } from '@nestjs/common';
import { MongoPrismaService } from '../services/mongo-prisma.service';
import { CityHallController } from '@/controllers/city-hall.controller';
import { MongoModule } from './mongo-prisma.module';
import { CityHallService } from '@/services/city-hall.service';
import { CityHallRepository } from '@/repositories/city-hall.repository';
import { CityHallPrismaRepository } from '@/repositories/city-hall-prisma.repository';
import { AuthModule } from './auth.module';

@Module({
    imports: [MongoModule, AuthModule],
    controllers: [CityHallController],
    providers: [
        MongoPrismaService,
        CityHallService,
        {
            provide: CityHallRepository,
            useClass: CityHallPrismaRepository,
        },
    ],
    exports: [],
})
export class CityHallModule {}
