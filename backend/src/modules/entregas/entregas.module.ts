import { Module } from '@nestjs/common';
import { EntregasController } from './entregas.controller';
import { EntregasService } from './entregas.service';
import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [EventsModule, NotificationsModule],
  controllers: [EntregasController],
  providers: [EntregasService],
  exports: [EntregasService],
})
export class EntregasModule {}
