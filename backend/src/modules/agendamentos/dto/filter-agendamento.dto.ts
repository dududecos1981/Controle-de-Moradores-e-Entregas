import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterAgendamentoDto {
  @ApiPropertyOptional({ description: 'Busca textual por nome do visitante ou solicitante' })
  @IsString()
  @IsOptional()
  busca?: string;

  @ApiPropertyOptional({
    description: 'Status do agendamento',
    enum: ['AGENDADO', 'AUTORIZADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO', 'EXPIRADO'],
  })
  @IsOptional()
  @IsIn(['AGENDADO', 'AUTORIZADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO', 'EXPIRADO'])
  status?: string;

  @ApiPropertyOptional({ description: 'Filtrar por unidade' })
  @IsUUID('4')
  @IsOptional()
  unidade_id?: string;

  @ApiPropertyOptional({ description: 'Filtrar por visitante' })
  @IsUUID('4')
  @IsOptional()
  visitante_id?: string;

  @ApiPropertyOptional({ description: 'Página atual', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Limite por página', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;
}
