import { MobileDeviceService } from '@/services/mobile-device.service';
import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from '@/services/prisma.service';
import { MobileDeviceController } from '@/controllers/mobile-device.controller';
import { PatientModule } from './patient.module';
import { AuthModule } from './auth.module';

@Module({
    imports: [forwardRef(() => AuthModule), forwardRef(() => PatientModule)],
    controllers: [MobileDeviceController],
    providers: [PrismaService, MobileDeviceService],
    exports: [MobileDeviceService],
})
export class MobileDeviceModule {}
