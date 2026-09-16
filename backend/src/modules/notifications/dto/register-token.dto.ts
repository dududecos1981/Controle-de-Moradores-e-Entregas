import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RegisterDeviceTokenDto {
  @ApiProperty({ description: 'FCM Device Token do smartphone do morador' })
  @IsString()
  @IsNotEmpty({ message: 'O FCM Token é obrigatório.' })
  fcm_token: string;

  @ApiProperty({ example: 'iOS', enum: ['iOS', 'Android', 'Web'] })
  @IsString()
  @IsNotEmpty()
  plataforma: 'iOS' | 'Android' | 'Web';
}

export class SendPushDto {
  @ApiProperty({ description: 'UUID da Unidade' })
  @IsUUID('4')
  unidade_id: string;

  @ApiProperty({ example: '📦 Sua encomenda chegou!' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 'Um pacote da Amazon acaba de ser registrado na portaria.' })
  @IsString()
  @IsNotEmpty()
  corpo: string;

  @ApiProperty({ required: false })
  dados?: Record<string, string>;
}
