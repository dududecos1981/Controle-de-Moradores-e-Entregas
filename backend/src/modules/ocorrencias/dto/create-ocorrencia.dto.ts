import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export enum CategoriaOcorrencia {
  BARULHO = 'BARULHO',
  MANUTENCAO = 'MANUTENCAO',
  SEGURANCA = 'SEGURANCA',
  LIMPEZA = 'LIMPEZA',
  CONVIVENCIA = 'CONVIVENCIA',
  GARAGEM = 'GARAGEM',
  OUTRO = 'OUTRO',
}

export enum StatusOcorrencia {
  ABERTO = 'ABERTO',
  EM_ANALISE = 'EM_ANALISE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  RESOLVIDO = 'RESOLVIDO',
  CANCELADO = 'CANCELADO',
}

export class CreateOcorrenciaDto {
  @ApiPropertyOptional({ description: 'ID da unidade/apartamento do solicitante' })
  @IsOptional()
  @IsString()
  unidade_id?: string;

  @ApiPropertyOptional({ description: 'Bloco da unidade' })
  @IsOptional()
  @IsString()
  unidade_bloco?: string;

  @ApiPropertyOptional({ description: 'Número do apartamento' })
  @IsOptional()
  @IsString()
  unidade_numero?: string;

  @ApiProperty({ description: 'Título resumido do chamado/ocorrência', example: 'Lâmpada do hall queimada' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ description: 'Descrição detalhada do problema', example: 'A lâmpada do hall do 2º andar está piscando constantemente.' })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiPropertyOptional({ enum: CategoriaOcorrencia, default: CategoriaOcorrencia.OUTRO })
  @IsOptional()
  @IsString()
  categoria?: any;

  @ApiPropertyOptional({ description: 'URL da foto/evidência anexada', example: 'https://storage.neon.tech/ocorrencias/foto1.jpg' })
  @IsString()
  @IsOptional()
  foto_url?: string;
}
