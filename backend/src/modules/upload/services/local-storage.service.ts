import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface SavedFileResult {
  url: string;
  path: string;
  filename: string;
  driver: 'local' | 's3';
}

@Injectable()
export class LocalStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadDir: string;
  private readonly baseAppUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = path.resolve(
      process.cwd(),
      this.configService.get<string>('storage.destination', './uploads'),
    );
    this.baseAppUrl = this.configService.get<string>('storage.baseAppUrl', 'http://localhost:3000');

    // Cria diretório de uploads se não existir
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Diretório local de uploads criado em: ${this.uploadDir}`);
    }
  }

  async saveFile(buffer: Buffer, filename: string, subfolder = ''): Promise<SavedFileResult> {
    const targetDir = subfolder ? path.join(this.uploadDir, subfolder) : this.uploadDir;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fullPath = path.join(targetDir, filename);
    await fs.promises.writeFile(fullPath, buffer);

    const relativeUrlPath = subfolder ? `uploads/${subfolder}/${filename}` : `uploads/${filename}`;
    const url = `${this.baseAppUrl}/${relativeUrlPath}`;

    return {
      url,
      path: fullPath,
      filename,
      driver: 'local',
    };
  }

  async deleteFile(filename: string, subfolder = ''): Promise<boolean> {
    try {
      const fullPath = subfolder
        ? path.join(this.uploadDir, subfolder, filename)
        : path.join(this.uploadDir, filename);

      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Erro ao deletar arquivo local: ${filename}`, error);
      return false;
    }
  }
}
