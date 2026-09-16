import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LgpdRetentionService, ExpurgoResult } from './lgpd-retention.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Governança LGPD & Expurgo')
@Controller('lgpd')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LgpdController {
  constructor(private readonly lgpdRetentionService: LgpdRetentionService) {}

  @Post('executar-expurgo')
  @Roles('ADMINISTRADOR', 'SINDICO')
  @ApiOperation({
    summary: 'Executar rotina de expurgo e anonimização de visitantes expirados (Sob Demanda)',
    description: 'Executa a limpeza e anonimização de dados pessoais de visitantes inativos conforme os Artigos 15 e 16 da LGPD.',
  })
  @ApiQuery({ name: 'dias', required: false, example: 90, description: 'Dias de inatividade para corte' })
  @ApiResponse({ status: 200, description: 'Relatório da execução de expurgo' })
  async executarExpurgo(@Query('dias') dias?: number): Promise<ExpurgoResult> {
    return this.lgpdRetentionService.executarExpurgoVisitantes(dias ? Number(dias) : undefined);
  }
}
