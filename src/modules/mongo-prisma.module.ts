import { forwardRef, Global, Module } from '@nestjs/common';
import { MongoPrismaService } from '../services/mongo-prisma.service';
import { CityHallModule } from './city-hall.module';

@Global()
@Module({
    providers: [MongoPrismaService],
    exports: [MongoPrismaService],
})
export class MongoModule {}
