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
import { VeiculosService } from './veiculos.service';
import { CreateVeiculoDto, UpdateVeiculoDto } from './dto/create-veiculo.dto';
import { FilterVeiculoDto } from './dto/filter-veiculo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Veículos')
@Controller('veiculos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Get()
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Listar veículos cadastrados com filtros e busca' })
  @ApiResponse({ status: 200, description: 'Lista paginada de veículos' })
  async findAll(@Query() filters: FilterVeiculoDto) {
    return this.veiculosService.findAll(filters);
  }

  @Get('placa/:placa')
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Busca rápida de veículo e titular por placa' })
  @ApiParam({ name: 'placa', description: 'Placa do veículo (ex: BRA2E19)' })
  @ApiResponse({ status: 200, description: 'Dados do veículo encontrado' })
  async findByPlaca(@Param('placa') placa: string) {
    return this.veiculosService.findByPlaca(placa);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Obter detalhes de um veículo por ID' })
  @ApiParam({ name: 'id', description: 'UUID do veículo' })
  @ApiResponse({ status: 200, description: 'Dados detalhados do veículo' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.veiculosService.findOne(id);
  }

  @Post()
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Cadastrar novo veículo vinculado a uma unidade' })
  @ApiResponse({ status: 201, description: 'Veículo cadastrado com sucesso' })
  async create(@Body() dto: CreateVeiculoDto, @Req() req: any) {
    return this.veiculosService.create(dto, req.lgpdContext);
  }

  @Put(':id')
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Atualizar cadastro de veículo' })
  @ApiParam({ name: 'id', description: 'UUID do veículo' })
  @ApiResponse({ status: 200, description: 'Veículo atualizado com sucesso' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVeiculoDto,
    @Req() req: any,
  ) {
    return this.veiculosService.update(id, dto, req.lgpdContext);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Remover veículo' })
  @ApiParam({ name: 'id', description: 'UUID do veículo' })
  @ApiResponse({ status: 200, description: 'Veículo removido com sucesso' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.veiculosService.remove(id, req.lgpdContext);
  }
}
