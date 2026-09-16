import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

export interface ProcessedImageResult {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  format: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  prefix?: string;
}

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);

  /**
   * Comprime e redimensiona imagem removendo metadados EXIF sensíveis (LGPD)
   */
  async processImage(
    fileBuffer: Buffer,
    originalName: string,
    options: ImageProcessingOptions = {},
  ): Promise<ProcessedImageResult> {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 80,
      format = 'webp',
      prefix = 'img',
    } = options;

    try {
      const image = sharp(fileBuffer);
      const metadata = await image.metadata();

      if (!metadata.format) {
        throw new BadRequestException('O arquivo enviado não é uma imagem válida.');
      }

      // Pipeline do Sharp: Redimensiona sem distorção (fit inside), remove EXIF e converte para WebP
      let pipeline = image
        .rotate() // Corrige orientação baseada no EXIF antes de limpá-lo
        .resize({
          width: maxWidth,
          height: maxHeight,
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        });

      let mimeType = 'image/webp';
      if (format === 'webp') {
        pipeline = pipeline.webp({ quality, effort: 4 });
        mimeType = 'image/webp';
      } else if (format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality, progressive: true });
        mimeType = 'image/jpeg';
      } else if (format === 'png') {
        pipeline = pipeline.png({ compressionLevel: 8 });
        mimeType = 'image/png';
      }

      // strip metadata EXIF/GPS para conformidade com privacidade LGPD
      pipeline = pipeline.withMetadata({ orientation: undefined });

      const outputBuffer = await pipeline.toBuffer();
      const outputMetadata = await sharp(outputBuffer).metadata();

      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const filename = `${prefix}_${timestamp}_${randomId}.${format}`;

      this.logger.log(
        `Imagem processada com sucesso: ${originalName} (${fileBuffer.length} bytes) -> ${filename} (${outputBuffer.length} bytes, -${Math.round(
          (1 - outputBuffer.length / fileBuffer.length) * 100,
        )}%)`,
      );

      return {
        buffer: outputBuffer,
        filename,
        mimeType,
        format,
        width: outputMetadata.width || 0,
        height: outputMetadata.height || 0,
        sizeBytes: outputBuffer.length,
      };
    } catch (error) {
      this.logger.error(`Erro no processamento da imagem: ${error.message}`, error.stack);
      throw new BadRequestException(`Falha ao processar e comprimir imagem: ${error.message}`);
    }
  }
}
