import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString, IsOptional, IsEnum, IsBoolean, Matches } from 'class-validator';

export enum TipoVeiculo {
  CARRO = 'CARRO',
  MOTO = 'MOTO',
  BICICLETA = 'BICICLETA',
  CAMINHAO = 'CAMINHAO',
  PATINETE = 'PATINETE',
  OUTRO = 'OUTRO',
}

export class CreateVeiculoDto {
  @ApiProperty({ description: 'ID da unidade/apartamento do veículo', example: 'a0000000-0000-0000-0000-000000000001' })
  @IsUUID()
  @IsNotEmpty()
  unidade_id: string;

  @ApiPropertyOptional({ description: 'ID do morador proprietário do veículo', example: 'b0000000-0000-0000-0000-000000000003' })
  @IsUUID()
  @IsOptional()
  usuario_id?: string;

  @ApiProperty({ description: 'Placa do veículo (padrão Mercosul ou antigo)', example: 'BRA2E19' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9-]{6,10}$/i, { message: 'Formato de placa inválido' })
  placa: string;

  @ApiProperty({ description: 'Marca e modelo do veículo', example: 'Toyota Corolla Cross XRE' })
  @IsString()
  @IsNotEmpty()
  marca_modelo: string;

  @ApiPropertyOptional({ description: 'Cor do veículo', example: 'Prata' })
  @IsString()
  @IsOptional()
  cor?: string;

  @ApiPropertyOptional({ enum: TipoVeiculo, default: TipoVeiculo.CARRO })
  @IsEnum(TipoVeiculo)
  @IsOptional()
  tipo?: TipoVeiculo;

  @ApiPropertyOptional({ description: 'Identificação da vaga de garagem', example: 'Vaga G-12 (Térreo)' })
  @IsString()
  @IsOptional()
  vaga_garagem?: string;

  @ApiPropertyOptional({ description: 'Status de atividade do veículo', default: true })
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;

  @ApiPropertyOptional({ description: 'Observações adicionais', example: 'Veículo com tag de acesso rápido' })
  @IsString()
  @IsOptional()
  observacoes?: string;
}

export class UpdateVeiculoDto {
  @ApiPropertyOptional({ description: 'ID da unidade/apartamento' })
  @IsUUID()
  @IsOptional()
  unidade_id?: string;

  @ApiPropertyOptional({ description: 'ID do morador proprietário' })
  @IsUUID()
  @IsOptional()
  usuario_id?: string;

  @ApiPropertyOptional({ description: 'Placa do veículo' })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Z0-9-]{6,10}$/i, { message: 'Formato de placa inválido' })
  placa?: string;

  @ApiPropertyOptional({ description: 'Marca e modelo' })
  @IsString()
  @IsOptional()
  marca_modelo?: string;

  @ApiPropertyOptional({ description: 'Cor' })
  @IsString()
  @IsOptional()
  cor?: string;

  @ApiPropertyOptional({ enum: TipoVeiculo })
  @IsEnum(TipoVeiculo)
  @IsOptional()
  tipo?: TipoVeiculo;

  @ApiPropertyOptional({ description: 'Identificação da vaga de garagem' })
  @IsString()
  @IsOptional()
  vaga_garagem?: string;

  @ApiPropertyOptional({ description: 'Status de atividade' })
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;

  @ApiPropertyOptional({ description: 'Observações adicionais' })
  @IsString()
  @IsOptional()
  observacoes?: string;
}
