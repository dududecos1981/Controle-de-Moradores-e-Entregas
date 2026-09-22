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

  @Get('auditoria')
  @Roles('ADMINISTRADOR', 'SINDICO')
  @ApiOperation({
    summary: 'Consultar trilha de auditoria imutável LGPD',
    description: 'Lista registros de auditoria com filtros por tabela, operação, autor e período.',
  })
  @ApiQuery({ name: 'tabela', required: false })
  @ApiQuery({ name: 'operacao', required: false })
  @ApiQuery({ name: 'data_inicio', required: false })
  @ApiQuery({ name: 'data_fim', required: false })
  @ApiQuery({ name: 'busca', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Trilha de auditoria LGPD' })
  async getAuditoria(
    @Query('tabela') tabela?: string,
    @Query('operacao') operacao?: string,
    @Query('data_inicio') data_inicio?: string,
    @Query('data_fim') data_fim?: string,
    @Query('busca') busca?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.lgpdRetentionService.getLogsAuditoria({
      tabela,
      operacao,
      data_inicio,
      data_fim,
      busca,
      page,
      limit,
    });
  }

  @Post('anonimizar/:id')
  @Roles('ADMINISTRADOR', 'SINDICO')
  @ApiOperation({
    summary: 'Executar direito ao esquecimento e anonimização de titular (Art. 18 LGPD)',
  })
  @ApiResponse({ status: 200, description: 'Titular anonimizado com sucesso' })
  async anonimizarUsuario(
    @Query('id') id: string,
    @Body('motivo') motivo?: string,
  ) {
    return this.lgpdRetentionService.anonimizarUsuario(id, motivo);
  }

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

