import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { FilterAgendamentoDto } from './dto/filter-agendamento.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Agendamentos de Visita')
@ApiBearerAuth('bearer')
@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar agendamentos e autorizações de visita com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos retornada com sucesso.' })
  findAll(@Query() filters: FilterAgendamentoDto) {
    return this.agendamentosService.findAll(filters);
  }

  @Get('qrcode/:hash')
  @ApiOperation({ summary: 'Validar agendamento via hash do QR Code na portaria' })
  @ApiResponse({ status: 200, description: 'Agendamento válido retornado.' })
  @ApiResponse({ status: 404, description: 'QR Code inválido ou expirado.' })
  findByQrCode(@Param('hash') hash: string) {
    return this.agendamentosService.findByQrCode(hash);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um agendamento por ID' })
  @ApiResponse({ status: 200, description: 'Detalhes do agendamento encontrados.' })
  findOne(@Param('id') id: string) {
    return this.agendamentosService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Criar novo agendamento de visita com QR Code (Morador/Síndico/Admin)' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso.' })
  create(@Body() dto: CreateAgendamentoDto, @Req() req: any) {
    const userId = req.user?.id || 'b0000000-0000-0000-0000-000000000003';
    return this.agendamentosService.create(dto, userId, {
      userId,
      userName: req.user?.nome_completo,
    });
  }

  @Patch(':id/entrada')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR', 'PORTEIRO', 'SINDICO')
  @ApiOperation({ summary: 'Registrar entrada de visitante na portaria' })
  @ApiResponse({ status: 200, description: 'Entrada registrada com sucesso.' })
  registrarEntrada(@Param('id') id: string, @Req() req: any) {
    const porteiroId = req.user?.id || 'b0000000-0000-0000-0000-000000000002';
    return this.agendamentosService.registrarEntrada(id, porteiroId, {
      userId: porteiroId,
      userName: req.user?.nome_completo,
    });
  }

  @Patch(':id/saida')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR', 'PORTEIRO', 'SINDICO')
  @ApiOperation({ summary: 'Registrar saída de visitante na portaria' })
  @ApiResponse({ status: 200, description: 'Saída registrada com sucesso.' })
  registrarSaida(@Param('id') id: string, @Req() req: any) {
    const porteiroId = req.user?.id || 'b0000000-0000-0000-0000-000000000002';
    return this.agendamentosService.registrarSaida(id, porteiroId, {
      userId: porteiroId,
      userName: req.user?.nome_completo,
    });
  }

  @Patch(':id/cancelar')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancelar um agendamento de visita' })
  @ApiResponse({ status: 200, description: 'Agendamento cancelado com sucesso.' })
  cancelar(@Param('id') id: string, @Req() req: any) {
    return this.agendamentosService.cancelar(id, {
      userId: req.user?.id,
      userName: req.user?.nome_completo,
    });
  }
}
