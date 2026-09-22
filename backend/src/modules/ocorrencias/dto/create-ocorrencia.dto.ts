import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

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
  @ApiProperty({ description: 'ID da unidade/apartamento do solicitante' })
  @IsUUID()
  @IsNotEmpty()
  unidade_id: string;

  @ApiProperty({ description: 'Título resumido do chamado/ocorrência', example: 'Lâmpada do hall queimada' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ description: 'Descrição detalhada do problema', example: 'A lâmpada do hall do 2º andar está piscando constantemente.' })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiPropertyOptional({ enum: CategoriaOcorrencia, default: CategoriaOcorrencia.OUTRO })
  @IsEnum(CategoriaOcorrencia)
  @IsOptional()
  categoria?: CategoriaOcorrencia;

  @ApiPropertyOptional({ description: 'URL da foto/evidência anexada', example: 'https://storage.neon.tech/ocorrencias/foto1.jpg' })
  @IsString()
  @IsOptional()
  foto_url?: string;
}
