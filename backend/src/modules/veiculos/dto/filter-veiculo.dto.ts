import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsBoolean } from 'class-validator';
import { TipoVeiculo } from './create-veiculo.dto';
import { Transform } from 'class-transformer';

export class FilterVeiculoDto {
  @ApiPropertyOptional({ description: 'Termo de busca (placa, modelo, morador, unidade)' })
  @IsString()
  @IsOptional()
  busca?: string;

  @ApiPropertyOptional({ description: 'Filtro específico por placa' })
  @IsString()
  @IsOptional()
  placa?: string;

  @ApiPropertyOptional({ description: 'Filtro por ID de unidade' })
  @IsUUID()
  @IsOptional()
  unidade_id?: string;

  @ApiPropertyOptional({ description: 'Filtro por Bloco' })
  @IsString()
  @IsOptional()
  bloco?: string;

  @ApiPropertyOptional({ description: 'Filtro por Número do Apartamento' })
  @IsString()
  @IsOptional()
  numero?: string;

  @ApiPropertyOptional({ enum: TipoVeiculo })
  @IsEnum(TipoVeiculo)
  @IsOptional()
  tipo?: TipoVeiculo;

  @ApiPropertyOptional({ description: 'Filtrar por status ativo/inativo' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  ativo?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;
}
