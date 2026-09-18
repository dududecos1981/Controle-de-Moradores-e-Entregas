import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { EntregasService } from './entregas.service';
import { CreateEntregaDto } from './dto/create-entrega.dto';
import { FilterEntregaDto } from './dto/filter-entrega.dto';
import { RetirarEntregaDto } from './dto/retirar-entrega.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Entregas')
@ApiBearerAuth('bearer')
@Controller('entregas')
export class EntregasController {
  constructor(private readonly entregasService: EntregasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar entregas e encomendas com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de entregas retornada com sucesso.' })
  findAll(@Query() filters: FilterEntregaDto) {
    return this.entregasService.findAll(filters);
  }

  @Get('metricas')
  @ApiOperation({ summary: 'Obter métricas resumidas para o dashboard da portaria' })
  @ApiResponse({ status: 200, description: 'Métricas de encomendas pendentes e concluídas.' })
  getMetrics() {
    return this.entregasService.getDashboardMetrics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar detalhes de uma entrega específica por ID' })
  @ApiResponse({ status: 200, description: 'Dados da entrega encontrados.' })
  @ApiResponse({ status: 404, description: 'Entrega não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.entregasService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR', 'PORTEIRO', 'SINDICO')
  @ApiOperation({ summary: 'Registrar o recebimento de nova encomenda na portaria' })
  @ApiResponse({ status: 201, description: 'Entrega registrada com sucesso.' })
  create(@Body() dto: CreateEntregaDto, @Req() req: any) {
    const porteiroId = req.user?.id || 'b0000000-0000-0000-0000-000000000002';
    return this.entregasService.create(dto, porteiroId, {
      userId: porteiroId,
      userName: req.user?.nome_completo,
    });
  }

  @Patch(':id/retirar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR', 'PORTEIRO', 'SINDICO')
  @ApiOperation({ summary: 'Dar baixa e registrar retirada de encomenda na portaria' })
  @ApiResponse({ status: 200, description: 'Baixa de entrega efetuada com sucesso.' })
  retirar(
    @Param('id') id: string,
    @Body() dto: RetirarEntregaDto,
    @Req() req: any,
  ) {
    const porteiroId = req.user?.id || 'b0000000-0000-0000-0000-000000000002';
    return this.entregasService.retirar(id, dto, porteiroId, {
      userId: porteiroId,
      userName: req.user?.nome_completo,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR', 'SINDICO')
  @ApiOperation({ summary: 'Remover registro de entrega (somente Administrador/Síndico)' })
  @ApiResponse({ status: 200, description: 'Entrega removida com sucesso.' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.entregasService.remove(id, {
      userId: req.user?.id,
      userName: req.user?.nome_completo,
    });
  }
}
