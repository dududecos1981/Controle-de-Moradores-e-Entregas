import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterEntregaDto {
  @ApiPropertyOptional({ description: 'Termo de busca geral (código, rastreio, morador, transportadora)' })
  @IsString()
  @IsOptional()
  busca?: string;

  @ApiPropertyOptional({
    description: 'Status da entrega',
    enum: ['AGUARDANDO_RETIRADA', 'RETIRADO', 'DEVOLVIDO', 'EXTRAVIADO'],
  })
  @IsOptional()
  @IsIn(['AGUARDANDO_RETIRADA', 'RETIRADO', 'DEVOLVIDO', 'EXTRAVIADO'])
  status?: string;

  @ApiPropertyOptional({ description: 'ID da unidade para filtro' })
  @IsUUID('4')
  @IsOptional()
  unidade_id?: string;

  @ApiPropertyOptional({ description: 'Bloco da unidade' })
  @IsString()
  @IsOptional()
  bloco?: string;

  @ApiPropertyOptional({ description: 'Número do apartamento' })
  @IsString()
  @IsOptional()
  numero?: string;

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
