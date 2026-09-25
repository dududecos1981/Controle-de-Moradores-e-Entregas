import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { join } from 'path';

import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UnidadesModule } from './modules/unidades/unidades.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { VisitantesModule } from './modules/visitantes/visitantes.module';
import { UploadModule } from './modules/upload/upload.module';
import { EventsModule } from './modules/events/events.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { LgpdModule } from './modules/lgpd/lgpd.module';
import { EntregasModule } from './modules/entregas/entregas.module';
import { AgendamentosModule } from './modules/agendamentos/agendamentos.module';
import { VeiculosModule } from './modules/veiculos/veiculos.module';
import { OcorrenciasModule } from './modules/ocorrencias/ocorrencias.module';
import { ReservasModule } from './modules/reservas/reservas.module';

import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LgpdSessionInterceptor } from './common/interceptors/lgpd-session.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', join(__dirname, '../.env'), join(__dirname, '../../.env')],
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
    }),
    DatabaseModule,
    AuthModule,
    UnidadesModule,
    UsuariosModule,
    VisitantesModule,
    EntregasModule,
    AgendamentosModule,
    VeiculosModule,
    OcorrenciasModule,
    ReservasModule,
    UploadModule,
    EventsModule,
    NotificationsModule,
    LgpdModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LgpdSessionInterceptor,
    },
  ],
})
export class AppModule {}
