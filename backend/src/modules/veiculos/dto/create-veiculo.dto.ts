import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, Matches } from 'class-validator';

export enum TipoVeiculo {
  CARRO = 'CARRO',
  MOTO = 'MOTO',
  BICICLETA = 'BICICLETA',
  CAMINHAO = 'CAMINHAO',
  PATINETE = 'PATINETE',
  OUTRO = 'OUTRO',
}

export class CreateVeiculoDto {
  @ApiPropertyOptional({ description: 'ID da unidade/apartamento do veículo', example: 'a0000000-0000-0000-0000-000000000001' })
  @IsOptional()
  @IsString()
  unidade_id?: string;

  @ApiPropertyOptional({ description: 'Bloco da unidade', example: 'A' })
  @IsOptional()
  @IsString()
  unidade_bloco?: string;

  @ApiPropertyOptional({ description: 'Número do apartamento', example: '101' })
  @IsOptional()
  @IsString()
  unidade_numero?: string;

  @ApiPropertyOptional({ description: 'ID do morador proprietário do veículo', example: 'b0000000-0000-0000-0000-000000000003' })
  @IsOptional()
  @IsString()
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
  @IsOptional()
  @IsString()
  tipo?: any;

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
  @IsOptional()
  @IsString()
  unidade_id?: string;

  @ApiPropertyOptional({ description: 'Bloco da unidade' })
  @IsOptional()
  @IsString()
  unidade_bloco?: string;

  @ApiPropertyOptional({ description: 'Número da unidade' })
  @IsOptional()
  @IsString()
  unidade_numero?: string;

  @ApiPropertyOptional({ description: 'ID do morador proprietário' })
  @IsOptional()
  @IsString()
  usuario_id?: string;

  @ApiPropertyOptional({ description: 'Placa do veículo' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9-]{6,10}$/i, { message: 'Formato de placa inválido' })
  placa?: string;

  @ApiPropertyOptional({ description: 'Marca e modelo' })
  @IsOptional()
  @IsString()
  marca_modelo?: string;

  @ApiPropertyOptional({ description: 'Cor' })
  @IsOptional()
  @IsString()
  cor?: string;

  @ApiPropertyOptional({ enum: TipoVeiculo })
  @IsOptional()
  @IsString()
  tipo?: any;

  @ApiPropertyOptional({ description: 'Identificação da vaga de garagem' })
  @IsOptional()
  @IsString()
  vaga_garagem?: string;

  @ApiPropertyOptional({ description: 'Status de atividade' })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional({ description: 'Observações adicionais' })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
