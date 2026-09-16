import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export type TipoUnidade = 'APARTAMENTO' | 'CASA' | 'SALA_COMERCIAL' | 'COBERTURA' | 'OUTRO';
export type StatusUnidade = 'ATIVO' | 'INATIVO' | 'EM_REFORMA';

export class CreateUnidadeDto {
  @ApiProperty({ example: 'A', description: 'Identificação do bloco, torre ou quadra' })
  @IsString()
  @IsNotEmpty({ message: 'O bloco é obrigatório.' })
  bloco: string;

  @ApiProperty({ example: '101', description: 'Número identificador da unidade' })
  @IsString()
  @IsNotEmpty({ message: 'O número da unidade é obrigatório.' })
  numero: string;

  @ApiPropertyOptional({
    example: 'APARTAMENTO',
    enum: ['APARTAMENTO', 'CASA', 'SALA_COMERCIAL', 'COBERTURA', 'OUTRO'],
  })
  @IsOptional()
  @IsEnum(['APARTAMENTO', 'CASA', 'SALA_COMERCIAL', 'COBERTURA', 'OUTRO'], {
    message: 'Tipo de unidade inválido.',
  })
  tipo?: TipoUnidade;

  @ApiPropertyOptional({
    example: 'ATIVO',
    enum: ['ATIVO', 'INATIVO', 'EM_REFORMA'],
  })
  @IsOptional()
  @IsEnum(['ATIVO', 'INATIVO', 'EM_REFORMA'], {
    message: 'Status de unidade inválido.',
  })
  status?: StatusUnidade;

  @ApiPropertyOptional({ example: 1, description: 'Andar ou pavimento' })
  @IsOptional()
  @IsInt({ message: 'O andar deve ser um número inteiro.' })
  andar?: number;

  @ApiPropertyOptional({ example: 'Apartamento de frente para o jardim', description: 'Observações gerais' })
  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class UpdateUnidadeDto {
  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  bloco?: string;

  @ApiPropertyOptional({ example: '102' })
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

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  andar?: number;

  @ApiPropertyOptional({ example: 'Observação atualizada' })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
