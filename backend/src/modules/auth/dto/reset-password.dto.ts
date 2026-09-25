import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'admin@condominio.com.br', description: 'E-mail cadastrado' })
  @IsString()
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @ApiProperty({ example: '111.222.333-44', description: 'CPF cadastrado' })
  @IsString()
  @IsNotEmpty({ message: 'O CPF é obrigatório.' })
  cpf: string;

  @ApiProperty({ example: 'NovaSenha123!', description: 'Nova senha com no mínimo 6 dígitos' })
  @IsString()
  @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres.' })
  nova_senha: string;
}
