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
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/create-usuario.dto';
import { FilterUsuarioDto, UsuarioResponseDto, AnonimizarUsuarioDto } from './dto/filter-usuario.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Usuários')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO')
  @ApiOperation({ summary: 'Listar usuários com filtros avançados e busca textual' })
  @ApiResponse({ status: 200, description: 'Lista paginada de usuários' })
  async findAll(@Query() filters: FilterUsuarioDto) {
    return this.usuariosService.findAll(filters);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'SINDICO', 'PORTEIRO', 'MORADOR')
  @ApiOperation({ summary: 'Obter dados cadastrais de um usuário específico' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiResponse({ status: 200, type: UsuarioResponseDto })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  @Roles('ADMINISTRADOR', 'SINDICO')
  @ApiOperation({ summary: 'Cadastrar novo usuário (Apenas ADMIN e SÍNDICO)' })
  @ApiResponse({ status: 201, type: UsuarioResponseDto, description: 'Usuário cadastrado com sucesso' })
  async create(@Body() dto: CreateUsuarioDto, @Req() req: any) {
    return this.usuariosService.create(dto, req.lgpdContext);
  }

  @Put(':id')
  @Roles('ADMINISTRADOR', 'SINDICO')
  @ApiOperation({ summary: 'Atualizar cadastro de usuário' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiResponse({ status: 200, type: UsuarioResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUsuarioDto,
    @Req() req: any,
  ) {
    return this.usuariosService.update(id, dto, req.lgpdContext);
  }

  @Post(':id/anonimizar-lgpd')
  @Roles('ADMINISTRADOR', 'SINDICO')
  @ApiOperation({
    summary: 'Executar Direito ao Esquecimento / Anonimização de Dados (LGPD Art. 18)',
    description: 'Anonimiza nome, CPF, e-mail e telefone, preservando integridade histórica de visitas e entregas.',
  })
  @ApiParam({ name: 'id', description: 'UUID do titular' })
  @ApiResponse({ status: 200, description: 'Titular anonimizado com sucesso' })
  async anonimizarLgpd(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AnonimizarUsuarioDto,
    @Req() req: any,
  ) {
    return this.usuariosService.anonimizarLgpd(id, dto.motivo, req.lgpdContext);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Excluir usuário do sistema' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.usuariosService.remove(id, req.lgpdContext);
  }
}
