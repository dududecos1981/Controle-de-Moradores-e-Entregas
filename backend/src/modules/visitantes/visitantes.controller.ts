import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { VisitantesService } from './visitantes.service';
import { CreateVisitanteDto, UpdateVisitanteDto } from './dto/create-visitante.dto';
import { FilterVisitanteDto, VisitanteResponseDto } from './dto/filter-visitante.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Visitantes')
@Controller('visitantes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VisitantesController {
  constructor(private readonly visitantesService: VisitantesService) {}

  @Get()
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Listar visitantes com filtros por nome, documento, placa e tipo' })
  @ApiResponse({ status: 200, description: 'Lista paginada de visitantes' })
  async findAll(@Query() filters: FilterVisitanteDto) {
    return this.visitantesService.findAll(filters);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Obter dados de um visitante e histórico de acessos/visitas' })
  @ApiParam({ name: 'id', description: 'UUID do visitante' })
  @ApiResponse({ status: 200, type: VisitanteResponseDto })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.visitantesService.findOne(id);
  }

  @Post()
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO')
  @ApiOperation({ summary: 'Cadastrar novo visitante ou prestador de serviço' })
  @ApiResponse({ status: 201, type: VisitanteResponseDto, description: 'Visitante cadastrado' })
  async create(@Body() dto: CreateVisitanteDto, @Req() req: any) {
    return this.visitantesService.create(dto, req.lgpdContext);
  }

  @Put(':id')
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO')
  @ApiOperation({ summary: 'Atualizar cadastro do visitante' })
  @ApiParam({ name: 'id', description: 'UUID do visitante' })
  @ApiResponse({ status: 200, type: VisitanteResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVisitanteDto,
    @Req() req: any,
  ) {
    return this.visitantesService.update(id, dto, req.lgpdContext);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR', 'SINDICO')
  @ApiOperation({ summary: 'Excluir cadastro do visitante (Apenas ADMIN e SÍNDICO)' })
  @ApiParam({ name: 'id', description: 'UUID do visitante' })
  @ApiResponse({ status: 200, description: 'Visitante removido' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.visitantesService.remove(id, req.lgpdContext);
  }
}
