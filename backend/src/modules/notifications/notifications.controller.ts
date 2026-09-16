import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FcmService } from './fcm.service';
import { RegisterDeviceTokenDto, SendPushDto } from './dto/register-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notificações Push (FCM)')
@Controller('notificacoes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly fcmService: FcmService) {}

  @Post('dispositivo/registrar')
  @ApiOperation({ summary: 'Registrar token FCM do dispositivo móvel do usuário' })
  @ApiResponse({ status: 200, description: 'Token registrado com sucesso' })
  async registrarToken(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    await this.fcmService.salvarTokenDispositivo(userId, dto.fcm_token, dto.plataforma);
    return { success: true, message: 'Dispositivo registrado para receber notificações Push.' };
  }

  @Post('enviar-teste')
  @Roles('ADMINISTRADOR', 'PORTEIRO')
  @ApiOperation({ summary: 'Enviar notificação Push de teste para uma unidade' })
  async enviarPushTeste(@Body() dto: SendPushDto) {
    const res = await this.fcmService.enviarNotificacaoParaUnidade(dto.unidade_id, {
      titulo: dto.titulo,
      corpo: dto.corpo,
      dados: dto.dados,
    });
    return { success: true, ...res };
  }
}
