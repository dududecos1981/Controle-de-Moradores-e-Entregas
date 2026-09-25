import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../common/decorators/roles.decorator';

export class RegisterDto {
  @ApiProperty({ example: 'Mariana Fernandes', description: 'Nome completo do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
  nome_completo: string;

  @ApiProperty({ example: '111.222.333-44', description: 'CPF válido formatado' })
  @IsString()
  @IsNotEmpty({ message: 'O CPF é obrigatório.' })
  @Matches(/^[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}$/, {
    message: 'CPF deve estar no formato 000.000.000-00 ou conter 11 dígitos numéricos.',
  })
  cpf: string;

  @ApiProperty({ example: 'mariana.fernandes@email.com', description: 'E-mail para login' })
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @ApiProperty({ example: 'SenhaSegura123!', description: 'Senha com no mínimo 6 caracteres' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  senha: string;

  @ApiPropertyOptional({ example: '11999998888', description: 'Telefone/WhatsApp para contato' })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional({
    example: 'MORADOR',
    enum: ['ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR', 'PRESTADOR_SERVICO'],
  })
  @IsOptional()
  @IsEnum(['ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR', 'PRESTADOR_SERVICO'], {
    message: 'Perfil de usuário inválido.',
  })
  perfil?: UserRole;

  @ApiPropertyOptional({ example: 'a0000000-0000-0000-0000-000000000001', description: 'ID UUID da Unidade/Apartamento' })
  @IsOptional()
  @IsUUID('4', { message: 'ID da unidade deve ser um UUID v4 válido.' })
  unidade_id?: string;

  @ApiPropertyOptional({ example: 'A', description: 'Bloco ou Torre' })
  @IsOptional()
  @IsString()
  unidade_bloco?: string;

  @ApiPropertyOptional({ example: '101', description: 'Número do Apartamento' })
  @IsOptional()
  @IsString()
  unidade_numero?: string;
}
