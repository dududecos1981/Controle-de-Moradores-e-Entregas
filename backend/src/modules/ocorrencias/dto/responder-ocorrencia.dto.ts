import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { StatusOcorrencia } from './create-ocorrencia.dto';

export class ResponderOcorrenciaDto {
  @ApiProperty({ description: 'Parecer ou resposta do síndico/administração', example: 'Equipe de manutenção acionada. Reparo agendado para amanhã às 10h.' })
  @IsString()
  @IsNotEmpty()
  resposta_sindico: string;

  @ApiProperty({ enum: StatusOcorrencia, default: StatusOcorrencia.EM_ANDAMENTO })
  @IsEnum(StatusOcorrencia)
  @IsNotEmpty()
  status: StatusOcorrencia;
}
