import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoVisitante } from './create-visitante.dto';

export class FilterVisitanteDto {
  @ApiPropertyOptional({ example: 'Lucas' })
  @IsOptional()
  @IsString()
  busca?: string;

  @ApiPropertyOptional({ example: '555.666.777-88' })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiPropertyOptional({ example: 'BRA2E19' })
  @IsOptional()
  @IsString()
  placa_veiculo?: string;

  @ApiPropertyOptional({ enum: ['VISITANTE', 'PRESTADOR_SERVICO', 'ENTREGADOR', 'CORRETOR', 'OUTRO'] })
  @IsOptional()
  @IsEnum(['VISITANTE', 'PRESTADOR_SERVICO', 'ENTREGADOR', 'CORRETOR', 'OUTRO'])
  tipo?: TipoVisitante;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  limit?: number = 20;
}

export class VisitanteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome_completo: string;

  @ApiProperty({ nullable: true })
  cpf: string | null;

  @ApiProperty({ nullable: true })
  rg: string | null;

  @ApiProperty({ nullable: true })
  telefone: string | null;

  @ApiProperty({ nullable: true })
  foto_url: string | null;

  @ApiProperty()
  tipo: TipoVisitante;

  @ApiProperty({ nullable: true })
  empresa: string | null;

  @ApiProperty({ nullable: true })
  placa_veiculo: string | null;

  @ApiProperty()
  ativo: boolean;

  @ApiProperty({ nullable: true })
  observacoes: string | null;

  @ApiProperty({ example: 5, description: 'Total de acessos históricos registrados' })
  total_visitas?: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
