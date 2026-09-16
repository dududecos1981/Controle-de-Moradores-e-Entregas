import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ImageProcessorService } from './services/image-processor.service';
import { LocalStorageService } from './services/local-storage.service';
import { S3StorageService } from './services/s3-storage.service';

@Module({
  controllers: [UploadController],
  providers: [
    UploadService,
    ImageProcessorService,
    LocalStorageService,
    S3StorageService,
  ],
  exports: [UploadService, ImageProcessorService],
})
export class UploadModule {}
