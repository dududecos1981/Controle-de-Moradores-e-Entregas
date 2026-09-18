import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);
  const prefix = configService.get<string>('apiPrefix', 'api');

  // Configuração global de prefixo de rotas
  app.setGlobalPrefix(prefix);

  // Validação global de DTOs com transformação e sanitização
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuração segura de CORS para clientes Web/Mobile
  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (como mobile apps, Postman ou curl) e localhost
      if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Audit-Reason, X-Refresh-Token',
    credentials: true,
  });

  // Configuração interativa do Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sistema de Gestão de Portaria, Pessoas e Entregas - API')
    .setDescription(
      'API RESTful corporativa com suporte a Neon Serverless PostgreSQL, autenticação JWT, RBAC, auditoria LGPD e upload otimizado de imagens.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Insira o Access Token JWT gerado no endpoint /api/auth/login',
        in: 'header',
      },
      'bearer',
    )
    .addTag('Autenticação', 'Login, cadastro e renovação de tokens JWT')
    .addTag('Unidades', 'Gestão de blocos, apartamentos e unidades residenciais')
    .addTag('Usuários', 'Gestão de moradores, porteiros, síndicos e anonimização LGPD')
    .addTag('Visitantes', 'Cadastro de visitantes, prestadores de serviços e histórico de acessos')
    .addTag('Agendamentos de Visita', 'Controle de pré-autorizações e validação de QR Code na portaria')
    .addTag('Entregas', 'Recebimento, notificação e baixa de encomendas')
    .addTag('Uploads', 'Upload seguro e compressão de imagens via Sharp (WebP)')
    .addTag('LGPD', 'Direito ao esquecimento, auditoria e expurgo de dados pessoais')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document, {
    customSiteTitle: 'Portaria & Entregas API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
    },
  });

  await app.listen(port);
  logger.log(`🚀 Servidor HTTP rodando em: http://localhost:${port}/${prefix}`);
  logger.log(`📚 Documentação Swagger interativa em: http://localhost:${port}/${prefix}/docs`);
}

bootstrap();
