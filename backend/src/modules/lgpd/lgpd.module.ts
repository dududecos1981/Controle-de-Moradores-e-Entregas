import { Module } from '@nestjs/common';
import { LgpdRetentionService } from './lgpd-retention.service';
import { LgpdController } from './lgpd.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [LgpdController],
  providers: [LgpdRetentionService],
  exports: [LgpdRetentionService],
})
export class LgpdModule {}
