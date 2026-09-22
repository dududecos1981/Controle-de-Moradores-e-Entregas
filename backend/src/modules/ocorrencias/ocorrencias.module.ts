import { Module } from '@nestjs/common';
import { OcorrenciasController } from './ocorrencias.controller';
import { OcorrenciasService } from './ocorrencias.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [OcorrenciasController],
  providers: [OcorrenciasService],
  exports: [OcorrenciasService],
})
export class OcorrenciasModule {}
