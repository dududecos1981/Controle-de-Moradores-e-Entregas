import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { UserRole } from '../../../common/decorators/roles.decorator';
import { StatusUsuario } from './create-usuario.dto';

export class FilterUsuarioDto {
  @ApiPropertyOptional({ example: 'Mariana' })
  @IsOptional()
  @IsString()
  busca?: string;

  @ApiPropertyOptional({ example: '111.222.333-44' })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiPropertyOptional({ enum: ['ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR', 'PRESTADOR_SERVICO'] })
  @IsOptional()
  @IsEnum(['ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR', 'PRESTADOR_SERVICO'])
  perfil?: UserRole;

  @ApiPropertyOptional({ enum: ['ATIVO', 'INATIVO', 'BLOQUEADO', 'PENDENTE_APROVACAO'] })
  @IsOptional()
  @IsEnum(['ATIVO', 'INATIVO', 'BLOQUEADO', 'PENDENTE_APROVACAO'])
  status?: StatusUsuario;

  @ApiPropertyOptional({ example: 'a0000000-0000-0000-0000-000000000001' })
  @IsOptional()
  @IsUUID('4')
  unidade_id?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  limit?: number = 20;
}

export class AnonimizarUsuarioDto {
  @ApiProperty({
    example: 'Solicitação do morador exercendo direito ao esquecimento conforme Art. 18 LGPD',
    description: 'Motivo / Justificativa legal da anonimização',
  })
  @IsString()
  @IsNotEmpty({ message: 'O motivo da anonimização é obrigatório para auditoria LGPD.' })
  motivo: string;
}

export class UsuarioResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome_completo: string;

  @ApiProperty()
  cpf: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  telefone: string | null;

  @ApiProperty()
  perfil: UserRole;

  @ApiProperty()
  status: StatusUsuario;

  @ApiProperty()
  is_responsavel_unidade: boolean;

  @ApiProperty({ nullable: true })
  unidade_id: string | null;

  @ApiProperty({ nullable: true })
  unidade_bloco?: string | null;

  @ApiProperty({ nullable: true })
  unidade_numero?: string | null;

  @ApiProperty({ nullable: true })
  avatar_url: string | null;

  @ApiProperty()
  lgpd_termo_aceito: boolean;

  @ApiProperty()
  lgpd_anonimizado: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
