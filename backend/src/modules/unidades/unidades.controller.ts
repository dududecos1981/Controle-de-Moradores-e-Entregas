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
import { UnidadesService } from './unidades.service';
import { CreateUnidadeDto, UpdateUnidadeDto } from './dto/create-unidade.dto';
import { FilterUnidadeDto, UnidadeResponseDto } from './dto/filter-unidade.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Unidades')
@Controller('unidades')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  @Get()
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Listar todas as unidades com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista paginada de unidades' })
  async findAll(@Query() filters: FilterUnidadeDto) {
    return this.unidadesService.findAll(filters);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Obter detalhes de uma unidade e seus moradores' })
  @ApiParam({ name: 'id', description: 'UUID da unidade' })
  @ApiResponse({ status: 200, type: UnidadeResponseDto })
  @ApiResponse({ status: 404, description: 'Unidade não encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.unidadesService.findOne(id);
  }

  @Post()
  @Roles('ADMINISTRADOR', 'SINDICO')
  @ApiOperation({ summary: 'Cadastrar uma nova unidade (Apenas ADMIN e SÍNDICO)' })
  @ApiResponse({ status: 201, type: UnidadeResponseDto, description: 'Unidade criada com sucesso' })
  @ApiResponse({ status: 409, description: 'Unidade já existente no mesmo bloco' })
  async create(@Body() dto: CreateUnidadeDto, @Req() req: any) {
    return this.unidadesService.create(dto, req.lgpdContext);
  }

  @Put(':id')
  @Roles('ADMINISTRADOR', 'SINDICO')
  @ApiOperation({ summary: 'Atualizar informações de uma unidade (Apenas ADMIN e SÍNDICO)' })
  @ApiParam({ name: 'id', description: 'UUID da unidade' })
  @ApiResponse({ status: 200, type: UnidadeResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUnidadeDto,
    @Req() req: any,
  ) {
    return this.unidadesService.update(id, dto, req.lgpdContext);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Excluir uma unidade (Apenas ADMINISTRADOR)' })
  @ApiParam({ name: 'id', description: 'UUID da unidade' })
  @ApiResponse({ status: 200, description: 'Unidade excluída' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.unidadesService.remove(id, req.lgpdContext);
  }
}
