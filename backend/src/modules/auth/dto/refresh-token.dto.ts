import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh Token JWT válido para renovação de sessão' })
  @IsString()
  @IsNotEmpty({ message: 'O refresh token é obrigatório.' })
  refreshToken: string;
}

export class UserPayloadDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome_completo: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  cpf: string;

  @ApiProperty()
  perfil: string;

  @ApiProperty({ nullable: true })
  unidade_id: string | null;

  @ApiProperty()
  status: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Token de acesso JWT (curta duração)' })
  accessToken: string;

  @ApiProperty({ description: 'Token de renovação JWT (longa duração)' })
  refreshToken: string;

  @ApiProperty({ description: 'Tempo em segundos até a expiração do access token', example: 900 })
  expiresIn: number;

  @ApiProperty({ type: UserPayloadDto })
  user: UserPayloadDto;
}
