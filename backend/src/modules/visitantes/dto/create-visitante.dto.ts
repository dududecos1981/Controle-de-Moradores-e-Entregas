import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export type TipoVisitante = 'VISITANTE' | 'PRESTADOR_SERVICO' | 'ENTREGADOR' | 'CORRETOR' | 'OUTRO';

export class CreateVisitanteDto {
  @ApiProperty({ example: 'Lucas Mendes de Oliveira', description: 'Nome completo do visitante' })
  @IsString()
  @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
  nome_completo: string;

  @ApiPropertyOptional({ example: '555.666.777-88', description: 'CPF do visitante' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}$/, {
    message: 'CPF deve estar no formato 000.000.000-00 ou conter 11 dígitos numéricos.',
  })
  cpf?: string;

  @ApiPropertyOptional({ example: '12.345.678-9', description: 'RG ou outro documento de identidade' })
  @IsOptional()
  @IsString()
  rg?: string;

  @ApiPropertyOptional({ example: '11988887777', description: 'Telefone para contato' })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional({
    example: 'VISITANTE',
    enum: ['VISITANTE', 'PRESTADOR_SERVICO', 'ENTREGADOR', 'CORRETOR', 'OUTRO'],
  })
  @IsOptional()
  @IsEnum(['VISITANTE', 'PRESTADOR_SERVICO', 'ENTREGADOR', 'CORRETOR', 'OUTRO'], {
    message: 'Tipo de visitante inválido.',
  })
  tipo?: TipoVisitante;

  @ApiPropertyOptional({ example: 'EletroFix Manutenção Ltda', description: 'Nome da empresa (se aplicável)' })
  @IsOptional()
  @IsString()
  empresa?: string;

  @ApiPropertyOptional({ example: 'BRA2E19', description: 'Placa do veículo' })
  @IsOptional()
  @IsString()
  placa_veiculo?: string;

  @ApiPropertyOptional({ example: 'http://localhost:3000/uploads/visitantes/foto.webp', description: 'URL da foto biométrica/portaria' })
  @IsOptional()
  @IsString()
  foto_url?: string;

  @ApiPropertyOptional({ example: 'Autorizado a entrar na piscina com morador', description: 'Observações' })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class UpdateVisitanteDto {
  @ApiPropertyOptional({ example: 'Lucas Mendes de Oliveira' })
  @IsOptional()
  @IsString()
  nome_completo?: string;

  @ApiPropertyOptional({ example: '555.666.777-88' })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiPropertyOptional({ example: '12.345.678-9' })
  @IsOptional()
  @IsString()
  rg?: string;

  @ApiPropertyOptional({ example: '11988887777' })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional({ enum: ['VISITANTE', 'PRESTADOR_SERVICO', 'ENTREGADOR', 'CORRETOR', 'OUTRO'] })
  @IsOptional()
  @IsEnum(['VISITANTE', 'PRESTADOR_SERVICO', 'ENTREGADOR', 'CORRETOR', 'OUTRO'])
  tipo?: TipoVisitante;

  @ApiPropertyOptional({ example: 'EletroFix Manutenção' })
  @IsOptional()
  @IsString()
  empresa?: string;

  @ApiPropertyOptional({ example: 'ABC1D23' })
  @IsOptional()
  @IsString()
  placa_veiculo?: string;

  @ApiPropertyOptional({ example: 'http://localhost:3000/uploads/visitantes/foto.webp' })
  @IsOptional()
  @IsString()
  foto_url?: string;

  @ApiPropertyOptional({ example: 'Observação alterada' })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
