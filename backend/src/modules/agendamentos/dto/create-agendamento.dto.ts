import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateAgendamentoDto {
  @ApiProperty({
    description: 'ID da unidade de destino da visita',
    example: 'a0000000-0000-0000-0000-000000000001',
  })
  @IsUUID('4', { message: 'ID da unidade deve ser um UUID v4 válido.' })
  @IsNotEmpty()
  unidade_id: string;

  @ApiProperty({
    description: 'ID do visitante cadastrado',
    example: 'c0000000-0000-0000-0000-000000000001',
  })
  @IsUUID('4', { message: 'ID do visitante deve ser um UUID v4 válido.' })
  @IsNotEmpty()
  visitante_id: string;

  @ApiProperty({
    description: 'Data e hora de início prevista da visita (ISO 8601)',
    example: '2026-09-17T14:00:00.000Z',
  })
  @IsDateString({}, { message: 'Data de início deve ser uma data válida no formato ISO 8601.' })
  @IsNotEmpty()
  data_inicio: string;

  @ApiProperty({
    description: 'Data e hora de término prevista da visita (ISO 8601)',
    example: '2026-09-17T18:00:00.000Z',
  })
  @IsDateString({}, { message: 'Data de fim deve ser uma data válida no formato ISO 8601.' })
  @IsNotEmpty()
  data_fim: string;

  @ApiPropertyOptional({
    description: 'Observações ou instruções de portaria',
    example: 'Visita familiar para o almoço',
  })
  @IsString()
  @IsOptional()
  observacoes?: string;
}
