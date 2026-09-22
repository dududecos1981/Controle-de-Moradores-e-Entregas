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
import { OcorrenciasService } from './ocorrencias.service';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { ResponderOcorrenciaDto } from './dto/responder-ocorrencia.dto';
import { FilterOcorrenciaDto } from './dto/filter-ocorrencia.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Ocorrências')
@Controller('ocorrencias')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OcorrenciasController {
  constructor(private readonly ocorrenciasService: OcorrenciasService) {}

  @Get()
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Listar ocorrências e chamados de manutenção com filtros' })
  @ApiResponse({ status: 200, description: 'Lista paginada de ocorrências' })
  async findAll(@Query() filters: FilterOcorrenciaDto) {
    return this.ocorrenciasService.findAll(filters);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Obter detalhes de uma ocorrência' })
  @ApiParam({ name: 'id', description: 'UUID da ocorrência' })
  @ApiResponse({ status: 200, description: 'Detalhes da ocorrência' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ocorrenciasService.findOne(id);
  }

  @Post()
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Abrir nova ocorrência ou chamado de manutenção' })
  @ApiResponse({ status: 201, description: 'Ocorrência criada com sucesso' })
  async create(@Body() dto: CreateOcorrenciaDto, @Req() req: any) {
    const usuarioId = req.user?.id || req.user?.sub;
    return this.ocorrenciasService.create(dto, usuarioId, req.lgpdContext);
  }

  @Patch(':id/responder')
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO')
  @ApiOperation({ summary: 'Responder e atualizar status de uma ocorrência (Apenas Síndico/Staff)' })
  @ApiParam({ name: 'id', description: 'UUID da ocorrência' })
  @ApiResponse({ status: 200, description: 'Ocorrência respondida com sucesso' })
  async responder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResponderOcorrenciaDto,
    @Req() req: any,
  ) {
    const sindicoId = req.user?.id || req.user?.sub;
    return this.ocorrenciasService.responder(id, dto, sindicoId, req.lgpdContext);
  }
}
