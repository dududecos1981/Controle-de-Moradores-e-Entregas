import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageProcessorService, ImageProcessingOptions } from './services/image-processor.service';
import { LocalStorageService, SavedFileResult } from './services/local-storage.service';
import { S3StorageService } from './services/s3-storage.service';
import { UploadResponseDto } from './dto/upload-response.dto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly driver: 'local' | 's3';

  constructor(
    private readonly configService: ConfigService,
    private readonly imageProcessor: ImageProcessorService,
    private readonly localStorage: LocalStorageService,
    private readonly s3Storage: S3StorageService,
  ) {
    this.driver = this.configService.get<'local' | 's3'>('storage.driver', 'local');
    this.logger.log(`Driver de armazenamento ativo: [${this.driver.toUpperCase()}]`);
  }

  /**
   * Processa imagem (sanitização EXIF, compressão WebP) e persiste no driver configurado
   */
  async uploadImage(
    file: Express.Multer.File,
    subfolder = 'geral',
    options?: ImageProcessingOptions,
  ): Promise<UploadResponseDto> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Nenhum arquivo enviado para upload.');
    }

    const processed = await this.imageProcessor.processImage(file.buffer, file.originalname, {
      prefix: subfolder,
      ...options,
    });

    let saved: SavedFileResult;

    if (this.driver === 's3') {
      try {
        saved = await this.s3Storage.saveFile(
          processed.buffer,
          processed.filename,
          processed.mimeType,
          subfolder,
        );
      } catch (err) {
        this.logger.warn(`Fallback para armazenamento local devido a erro no S3: ${err.message}`);
        saved = await this.localStorage.saveFile(processed.buffer, processed.filename, subfolder);
      }
    } else {
      saved = await this.localStorage.saveFile(processed.buffer, processed.filename, subfolder);
    }

    return {
      url: saved.url,
      filename: saved.filename,
      mimeType: processed.mimeType,
      sizeBytes: processed.sizeBytes,
      width: processed.width,
      height: processed.height,
      driver: saved.driver,
    };
  }
}
