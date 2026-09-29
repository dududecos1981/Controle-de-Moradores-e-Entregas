import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Header,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Administração & Backups')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRADOR')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('relatorios/metricas-gerais')
  @ApiOperation({ summary: 'Obter resumo consolidado de métricas operacionais do condomínio' })
  @ApiResponse({ status: 200, description: 'Métricas consolidadas de todas as tabelas' })
  async getMetricas() {
    return this.adminService.getMetricasGerais();
  }

  @Get('relatorios/detalhado')
  @ApiOperation({ summary: 'Gerar relatório analítico parametrizado por período e tipo' })
  @ApiResponse({ status: 200, description: 'Dados estruturados para exportação e gráficos' })
  async getRelatorio(
    @Query('tipo') tipo: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getRelatorioDetalhado(tipo || 'ENCOMENDAS', dataInicio, dataFim, status);
  }

  @Get('backup/export-json')
  @ApiOperation({ summary: 'Exportar backup completo do banco de dados em formato JSON' })
  @ApiResponse({ status: 200, description: 'Arquivo JSON estruturado com SHA-256' })
  async exportBackupJson(@Res() res: Response) {
    const backup = await this.adminService.exportBackupJson();
    const filename = `backup_portaria_neon_${new Date().toISOString().slice(0, 10)}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(backup);
  }

  @Get('backup/export-sql')
  @ApiOperation({ summary: 'Exportar script SQL Dump com DDL e registros para restauração' })
  @ApiResponse({ status: 200, description: 'Script SQL Dump para PostgreSQL' })
  async exportBackupSql(@Res() res: Response) {
    const sqlContent = await this.adminService.exportBackupSql();
    const filename = `backup_portaria_dump_${new Date().toISOString().slice(0, 10)}.sql`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(sqlContent);
  }

  @Post('backup/restore-json')
  @ApiOperation({ summary: 'Restaurar dados a partir de um arquivo JSON estruturado' })
  @ApiResponse({ status: 200, description: 'Resultado do processo de restauração segura' })
  async restoreBackup(@Body() payload: any) {
    return this.adminService.restoreBackupJson(payload);
  }
}
