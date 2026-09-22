import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator';

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
  @IsUUID()
  @IsNotEmpty()
  area_id: string;

  @ApiProperty({ description: 'ID da unidade/apartamento que está reservando' })
  @IsUUID()
  @IsNotEmpty()
  unidade_id: string;

  @ApiProperty({ description: 'Data da reserva (formato YYYY-MM-DD)', example: '2026-10-15' })
  @IsDateString()
  @IsNotEmpty()
  data_reserva: string;

  @ApiPropertyOptional({ enum: PeriodoReserva, default: PeriodoReserva.NOITE })
  @IsEnum(PeriodoReserva)
  @IsOptional()
  periodo?: PeriodoReserva;

  @ApiPropertyOptional({ description: 'Número estimado de convidados', example: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  convidados_estimados?: number;

  @ApiPropertyOptional({ description: 'Observações sobre o evento/reserva', example: 'Festa de aniversário infantil' })
  @IsString()
  @IsOptional()
  observacoes?: string;
}
