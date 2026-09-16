import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto, AuthResponseDto, UserPayloadDto } from './dto/refresh-token.dto';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticação de usuário com email e senha' })
  @ApiResponse({ status: 200, type: AuthResponseDto, description: 'Login efetuado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas ou usuário inativo' })
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<AuthResponseDto> {
    const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip) as string;
    return this.authService.login(dto, clientIp);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastro/Registro de novo usuário no condomínio' })
  @ApiResponse({ status: 201, type: AuthResponseDto, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 409, description: 'CPF ou E-mail já cadastrado' })
  async register(@Body() dto: RegisterDto, @Req() req: Request): Promise<AuthResponseDto> {
    const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip) as string;
    return this.authService.register(dto, clientIp);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Renovação do Access Token a partir do Refresh Token' })
  @ApiResponse({ status: 200, type: AuthResponseDto, description: 'Novo par de tokens gerado' })
  @ApiResponse({ status: 401, description: 'Refresh token expirado ou inválido' })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request): Promise<AuthResponseDto> {
    return this.authService.refreshToken((req as any).user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna os dados do perfil do usuário autenticado atual' })
  @ApiResponse({ status: 200, type: UserPayloadDto, description: 'Dados do perfil do usuário' })
  async getProfile(@CurrentUser() user: any): Promise<UserPayloadDto> {
    return user;
  }
}
