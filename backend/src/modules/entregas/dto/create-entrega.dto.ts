import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateEntregaDto {
  @ApiPropertyOptional({
    description: 'ID da unidade de destino da encomenda',
    example: 'a0000000-0000-0000-0000-000000000001',
  })
  @IsOptional()
  @IsString()
  unidade_id?: string;

  @ApiPropertyOptional({
    description: 'Bloco da unidade de destino',
    example: 'A',
  })
  @IsOptional()
  @IsString()
  unidade_bloco?: string;

  @ApiPropertyOptional({
    description: 'Número do apartamento/unidade',
    example: '101',
  })
  @IsOptional()
  @IsString()
  unidade_numero?: string;

  @ApiPropertyOptional({
    description: 'ID do morador destinatário (opcional)',
    example: 'b0000000-0000-0000-0000-000000000003',
  })
  @IsOptional()
  @IsString()
  usuario_destinatario_id?: string;

  @ApiPropertyOptional({
    description: 'Nome do morador destinatário',
    example: 'Nome do Destinatário',
  })
  @IsOptional()
  @IsString()
  morador_nome?: string;

  @ApiPropertyOptional({
    description: 'Telefone do morador destinatário',
    example: '11965432109',
  })
  @IsOptional()
  @IsString()
  morador_telefone?: string;

  @ApiProperty({
    description: 'Código de barras lido ou QR Code da encomenda',
    example: 'PKG-AMZ-789456123BR',
  })
  @IsString({ message: 'Código de barras deve ser texto.' })
  @IsNotEmpty({ message: 'Código de barras ou identificador é obrigatório.' })
  @MaxLength(100)
  codigo_barras_qrcode: string;

  @ApiPropertyOptional({
    description: 'Nome da transportadora ou empresa de entrega',
    example: 'Amazon Logística',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  transportadora?: string;

  @ApiPropertyOptional({
    description: 'Código de rastreamento do pacote',
    example: 'BR789456123AMZ',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  codigo_rastreio?: string;

  @ApiPropertyOptional({
    description: 'Descrição física ou observações do pacote',
    example: 'Caixa média (Eletrônicos)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  descricao_pacote?: string;

  @ApiPropertyOptional({
    description: 'URL da foto do pacote/etiqueta tirada na portaria',
    example: 'http://localhost:3000/uploads/entregas/pacote-001.webp',
  })
  @IsString()
  @IsOptional()
  foto_comprovante_url?: string;
}
