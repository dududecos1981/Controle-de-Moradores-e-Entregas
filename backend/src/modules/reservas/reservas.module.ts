import { Module } from '@nestjs/common';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}
