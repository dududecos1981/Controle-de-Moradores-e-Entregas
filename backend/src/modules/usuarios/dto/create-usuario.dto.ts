import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { UserRole } from '../../../common/decorators/roles.decorator';

export type StatusUsuario = 'ATIVO' | 'INATIVO' | 'BLOQUEADO' | 'PENDENTE_APROVACAO';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Nome do Usuário', description: 'Nome completo do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
  nome_completo: string;

  @ApiProperty({ example: '000.000.000-00', description: 'CPF válido formatado' })
  @IsString()
  @IsNotEmpty({ message: 'O CPF é obrigatório.' })
  @Matches(/^[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}$/, {
    message: 'CPF deve estar no formato 000.000.000-00 ou conter 11 dígitos numéricos.',
  })
  cpf: string;

  @ApiProperty({ example: 'usuario@dominio.com', description: 'E-mail para login' })
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @ApiPropertyOptional({ example: 'SenhaSegura123!', description: 'Senha de acesso inicial' })
  @IsOptional()
  @IsString()
  senha?: string;

  @ApiPropertyOptional({ example: '11987654321', description: 'Telefone para contato' })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional({
    example: 'MORADOR',
    enum: ['ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR', 'PRESTADOR_SERVICO', 'GERENTE', 'ZELADOR'],
  })
  @IsOptional()
  @IsString()
  perfil?: string;

  @ApiPropertyOptional({
    example: 'ATIVO',
    enum: ['ATIVO', 'INATIVO', 'BLOQUEADO', 'PENDENTE_APROVACAO'],
  })
  @IsOptional()
  @IsString()
  status?: StatusUsuario;

  @ApiPropertyOptional({ example: true, description: 'Indica se é o morador responsável pela unidade' })
  @IsOptional()
  @IsBoolean()
  is_responsavel_unidade?: boolean;

  @ApiPropertyOptional({ example: 'a0000000-0000-0000-0000-000000000001', description: 'ID UUID da Unidade' })
  @IsOptional()
  @IsString()
  unidade_id?: string;

  @ApiPropertyOptional({ example: 'A', description: 'Bloco ou Torre' })
  @IsOptional()
  @IsString()
  unidade_bloco?: string;

  @ApiPropertyOptional({ example: '101', description: 'Número da Unidade/Apartamento' })
  @IsOptional()
  @IsString()
  unidade_numero?: string;

  @ApiPropertyOptional({ example: 'http://localhost:3000/uploads/usuarios/avatar.webp' })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: 'Mariana Fernandes Silva' })
  @IsOptional()
  @IsString()
  nome_completo?: string;

  @ApiPropertyOptional({ example: 'mariana.silva@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'NovaSenha123!' })
  @IsOptional()
  @IsString()
  senha?: string;

  @ApiPropertyOptional({ example: '11999998888' })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional({ enum: ['ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR', 'PRESTADOR_SERVICO', 'GERENTE', 'ZELADOR'] })
  @IsOptional()
  @IsString()
  perfil?: string;

  @ApiPropertyOptional({ enum: ['ATIVO', 'INATIVO', 'BLOQUEADO', 'PENDENTE_APROVACAO'] })
  @IsOptional()
  @IsString()
  status?: StatusUsuario;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_responsavel_unidade?: boolean;

  @ApiPropertyOptional({ example: 'a0000000-0000-0000-0000-000000000001' })
  @IsOptional()
  @IsString()
  unidade_id?: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  unidade_bloco?: string;

  @ApiPropertyOptional({ example: '101' })
  @IsOptional()
  @IsString()
  unidade_numero?: string;

  @ApiPropertyOptional({ example: 'http://localhost:3000/uploads/usuarios/avatar.webp' })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}
