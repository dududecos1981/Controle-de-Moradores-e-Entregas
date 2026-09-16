import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { SavedFileResult } from './local-storage.service';

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('storage.aws.region', 'sa-east-1');
    this.bucketName = this.configService.get<string>('storage.aws.bucketName', '');
    const accessKeyId = this.configService.get<string>('storage.aws.accessKeyId', '');
    const secretAccessKey = this.configService.get<string>('storage.aws.secretAccessKey', '');

    if (accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log(`S3 Client inicializado para o bucket: [${this.bucketName}] (${this.region})`);
    } else {
      this.logger.warn('Credenciais da AWS S3 não configuradas. O driver S3 fallback estará indisponível.');
    }
  }

  async saveFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    subfolder = '',
  ): Promise<SavedFileResult> {
    if (!this.s3Client || !this.bucketName) {
      throw new InternalServerErrorException(
        'AWS S3 não configurado corretamente no ambiente.',
      );
    }

    const key = subfolder ? `${subfolder}/${filename}` : filename;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );

      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      return {
        url,
        path: key,
        filename,
        driver: 's3',
      };
    } catch (error) {
      this.logger.error(`Erro ao fazer upload no S3: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Falha no upload para o Amazon S3: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    if (!this.s3Client || !this.bucketName) return false;
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      return true;
    } catch (error) {
      this.logger.error(`Erro ao deletar arquivo do S3: ${key}`, error);
      return false;
    }
  }
}
