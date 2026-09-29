import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export enum PeriodoReserva {
  MANHA = 'MANHA',
  TARDE = 'TARDE',
  NOITE = 'NOITE',
  INTEGRAL = 'INTEGRAL',
}

export enum StatusReserva {
  SOLICITADO = 'SOLICITADO',
  CONFIRMADO = 'CONFIRMADO',
  CANCELADO = 'CANCELADO',
  CONCLUIDO = 'CONCLUIDO',
}

export class CreateReservaDto {
  @ApiProperty({ description: 'ID da área comum a ser reservada' })
  @IsString()
  @IsNotEmpty()
  area_id: string;

  @ApiPropertyOptional({ description: 'ID da unidade/apartamento que está reservando' })
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

  @ApiProperty({ description: 'Data da reserva (formato YYYY-MM-DD)', example: '2026-10-15' })
  @IsString()
  @IsNotEmpty()
  data_reserva: string;

  @ApiPropertyOptional({ enum: PeriodoReserva, default: PeriodoReserva.NOITE })
  @IsOptional()
  @IsString()
  periodo?: any;

  @ApiPropertyOptional({ description: 'Número estimado de convidados', example: 20 })
  @IsOptional()
  convidados_estimados?: number;

  @ApiPropertyOptional({ description: 'Observações sobre o evento/reserva', example: 'Festa de aniversário infantil' })
  @IsString()
  @IsOptional()
  observacoes?: string;
}
