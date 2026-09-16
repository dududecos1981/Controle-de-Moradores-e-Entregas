import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('imagem')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload seguro de foto com compressão automática Sharp (WebP)',
    description:
      'Recebe imagem (JPEG/PNG/WebP), sanitiza metadados sensíveis EXIF (LGPD), comprime para WebP e salva no armazenamento ativo (Local ou AWS S3).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'pasta',
    required: false,
    enum: ['visitantes', 'usuarios', 'entregas', 'geral'],
    description: 'Subpasta de destino para organização das imagens',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem a ser enviado (máx 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: UploadResponseDto, description: 'Imagem processada e salva com sucesso' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/i)) {
          return callback(
            new BadRequestException(
              'Apenas arquivos de imagem são permitidos (JPG, JPEG, PNG, WEBP).',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImagem(
    @UploadedFile() file: Express.Multer.File,
    @Query('pasta') pasta = 'geral',
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Por favor, selecione um arquivo de imagem.');
    }
    return this.uploadService.uploadImage(file, pasta);
  }
}
