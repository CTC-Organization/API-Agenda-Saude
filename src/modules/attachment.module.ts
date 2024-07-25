import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from '@/controllers/attachment.controller'; 
import { UploadService } from '@/services/attachment.service'; 

@Module({
    imports: [
        MulterModule.register({
          dest: './uploads', // O destino onde os arquivos serão armazenados
        }),
      ],
      controllers: [UploadController],
      providers: [UploadService],
})
export class UploadModule {}
