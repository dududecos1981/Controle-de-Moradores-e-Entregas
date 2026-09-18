import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class RetirarEntregaDto {
  @ApiProperty({
    description: 'Nome completo da pessoa que está retirando a encomenda',
    example: 'Mariana Fernandes',
  })
  @IsString({ message: 'Nome de quem retirou é obrigatório.' })
  @IsNotEmpty({ message: 'Informe o nome de quem está retirando a encomenda.' })
  @MaxLength(150)
  retirado_por_nome: string;

  @ApiPropertyOptional({
    description: 'Documento (RG ou CPF) da pessoa que retirou a encomenda',
    example: '333.444.555-66',
  })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  retirado_por_documento?: string;

  @ApiPropertyOptional({
    description: 'URL da foto da assinatura ou comprovante de entrega',
    example: 'http://localhost:3000/uploads/entregas/baixa-001.webp',
  })
  @IsString()
  @IsOptional()
  foto_retirada_url?: string;
}
