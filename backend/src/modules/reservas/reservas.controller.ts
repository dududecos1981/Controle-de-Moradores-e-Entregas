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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ReservasService } from './reservas.service';
import { CreateReservaDto, StatusReserva } from './dto/create-reserva.dto';
import { FilterReservaDto } from './dto/filter-reserva.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Reservas & Áreas Comuns')
@Controller('reservas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Get('areas')
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Listar todas as áreas comuns disponíveis (Churrasqueira, Salão, etc)' })
  @ApiResponse({ status: 200, description: 'Lista de áreas comuns' })
  async findAllAreas() {
    return this.reservasService.findAllAreas();
  }

  @Get()
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Listar reservas efetuadas com filtros por data, status e área' })
  @ApiResponse({ status: 200, description: 'Lista paginada de reservas' })
  async findAllReservas(@Query() filters: FilterReservaDto) {
    return this.reservasService.findAllReservas(filters);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Obter detalhes de uma reserva' })
  @ApiParam({ name: 'id', description: 'UUID da reserva' })
  @ApiResponse({ status: 200, description: 'Detalhes da reserva' })
  async findOneReserva(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservasService.findOneReserva(id);
  }

  @Post()
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Solicitar reserva de uma área comum' })
  @ApiResponse({ status: 201, description: 'Reserva confirmada com sucesso' })
  async createReserva(@Body() dto: CreateReservaDto, @Req() req: any) {
    const usuarioId = req.user?.id || req.user?.sub;
    return this.reservasService.createReserva(dto, usuarioId, req.lgpdContext);
  }

  @Patch(':id/status')
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Alterar status da reserva (ex: CANCELAR)' })
  @ApiParam({ name: 'id', description: 'UUID da reserva' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: StatusReserva,
    @Req() req: any,
  ) {
    const usuarioId = req.user?.id || req.user?.sub;
    return this.reservasService.updateStatusReserva(id, status, usuarioId, req.lgpdContext);
  }
}
