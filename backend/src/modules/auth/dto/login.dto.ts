import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@condominio.com.br', description: 'E-mail ou CPF cadastrado' })
  @IsString({ message: 'O e-mail ou CPF deve ser um texto válido.' })
  @IsNotEmpty({ message: 'O e-mail ou CPF é obrigatório.' })
  email: string;

  @ApiProperty({ example: 'SenhaSegura123!', description: 'Senha de acesso' })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(6, { message: 'A senha deve conter no mínimo 6 caracteres.' })
  senha: string;
}
