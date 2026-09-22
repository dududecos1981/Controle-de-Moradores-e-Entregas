import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { StatusReserva, PeriodoReserva } from './create-reserva.dto';

export class FilterReservaDto {
  @ApiPropertyOptional({ description: 'Filtrar por área comum' })
  @IsUUID()
  @IsOptional()
  area_id?: string;

  @ApiPropertyOptional({ description: 'Filtrar por unidade' })
  @IsUUID()
  @IsOptional()
  unidade_id?: string;

  @ApiPropertyOptional({ description: 'Filtrar por data específica (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  data?: string;

  @ApiPropertyOptional({ description: 'Data inicial para intervalo' })
  @IsDateString()
  @IsOptional()
  data_inicio?: string;

  @ApiPropertyOptional({ description: 'Data final para intervalo' })
  @IsDateString()
  @IsOptional()
  data_fim?: string;

  @ApiPropertyOptional({ enum: StatusReserva })
  @IsEnum(StatusReserva)
  @IsOptional()
  status?: StatusReserva;

  @ApiPropertyOptional({ enum: PeriodoReserva })
  @IsEnum(PeriodoReserva)
  @IsOptional()
  periodo?: PeriodoReserva;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;
}
