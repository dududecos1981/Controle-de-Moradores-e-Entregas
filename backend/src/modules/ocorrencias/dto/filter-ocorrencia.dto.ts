import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { CategoriaOcorrencia, StatusOcorrencia } from './create-ocorrencia.dto';

export class FilterOcorrenciaDto {
  @ApiPropertyOptional({ description: 'Termo de busca (título, descrição, morador)' })
  @IsString()
  @IsOptional()
  busca?: string;

  @ApiPropertyOptional({ enum: StatusOcorrencia })
  @IsEnum(StatusOcorrencia)
  @IsOptional()
  status?: StatusOcorrencia;

  @ApiPropertyOptional({ enum: CategoriaOcorrencia })
  @IsEnum(CategoriaOcorrencia)
  @IsOptional()
  categoria?: CategoriaOcorrencia;

  @ApiPropertyOptional({ description: 'Filtrar por unidade' })
  @IsUUID()
  @IsOptional()
  unidade_id?: string;

  @ApiPropertyOptional({ description: 'Filtrar por morador solicitante' })
  @IsUUID()
  @IsOptional()
  usuario_id?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;
}
