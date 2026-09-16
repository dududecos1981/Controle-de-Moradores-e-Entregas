import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoUnidade, StatusUnidade } from './create-unidade.dto';

export class FilterUnidadeDto {
  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  bloco?: string;

  @ApiPropertyOptional({ example: '101' })
  @IsOptional()
  @IsString()
  numero?: string;

  @ApiPropertyOptional({ enum: ['APARTAMENTO', 'CASA', 'SALA_COMERCIAL', 'COBERTURA', 'OUTRO'] })
  @IsOptional()
  @IsEnum(['APARTAMENTO', 'CASA', 'SALA_COMERCIAL', 'COBERTURA', 'OUTRO'])
  tipo?: TipoUnidade;

  @ApiPropertyOptional({ enum: ['ATIVO', 'INATIVO', 'EM_REFORMA'] })
  @IsOptional()
  @IsEnum(['ATIVO', 'INATIVO', 'EM_REFORMA'])
  status?: StatusUnidade;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  limit?: number = 20;
}

export class UnidadeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bloco: string;

  @ApiProperty()
  numero: string;

  @ApiProperty()
  tipo: TipoUnidade;

  @ApiProperty()
  status: StatusUnidade;

  @ApiProperty({ nullable: true })
  andar: number | null;

  @ApiProperty({ nullable: true })
  observacoes: string | null;

  @ApiProperty({ example: 3, description: 'Quantidade de moradores cadastrados nesta unidade' })
  total_moradores?: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
