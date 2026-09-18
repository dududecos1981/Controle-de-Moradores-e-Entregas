import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  afterInit(server: Server) {
    this.logger.log('📡 WebSocket Gateway (Socket.io) inicializado em /events');
  }

  handleConnection(client: Socket) {
    const { unidade, bloco, perfil, userId } = client.handshake.query;
    this.logger.log(`Cliente conectado: ${client.id} | Perfil: ${perfil || 'anônimo'} | Unidade: ${bloco || ''}-${unidade || ''}`);

    // Inscreve cliente na sala da sua unidade específica (ex: 'unidade_A_101')
    if (bloco && unidade) {
      const room = `unidade_${bloco}_${unidade}`;
      client.join(room);
      this.logger.log(`Cliente ${client.id} entrou na sala [${room}]`);
    }

    // Inscreve portaria na sala geral de portaria
    if (perfil === 'PORTEIRO' || perfil === 'ADMINISTRADOR') {
      client.join('portaria_geral');
      this.logger.log(`Operador ${client.id} entrou na sala [portaria_geral]`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  /**
   * Permite que o morador entre explicitamente na sala da sua unidade
   */
  @SubscribeMessage('join_unidade')
  handleJoinUnidade(
    @MessageBody() data: { bloco: string; numero: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `unidade_${data.bloco}_${data.numero}`;
    client.join(room);
    this.logger.log(`Cliente ${client.id} inscrito na sala [${room}] via evento`);
    return { status: 'joined', room };
  }

  /**
   * Notifica morador instantaneamente sobre a chegada de uma nova encomenda
   */
  notificarNovaEncomenda(bloco: string, numero: string, dadosEncomenda: any) {
    const room = `unidade_${bloco}_${numero}`;
    this.logger.log(`Emitindo evento 'encomenda_chegou' para a sala [${room}]`);
    this.server.to(room).emit('encomenda_chegou', {
      tipo: 'NOVA_ENCOMENDA',
      titulo: 'Sua encomenda chegou na portaria!',
      mensagem: `Pacote da ${dadosEncomenda.transportadora || 'Transportadora'} (${dadosEncomenda.codigo_barras_qrcode}) recebido.`,
      encomenda: dadosEncomenda,
      timestamp: new Date().toISOString(),
    });

    // Também notifica o painel geral da portaria
    this.server.to('portaria_geral').emit('feed_atualizado', {
      tipo: 'ENCOMENDA_REGISTRADA',
      encomendaId: dadosEncomenda.id,
    });
  }

  /**
   * Notifica morador instantaneamente sobre a chegada de visitante na portaria
   */
  notificarChegadaVisitante(bloco: string, numero: string, dadosVisitante: any) {
    const room = `unidade_${bloco}_${numero}`;
    this.logger.log(`Emitindo evento 'visitante_chegou' para a sala [${room}]`);
    this.server.to(room).emit('visitante_chegou', {
      tipo: 'CHEGADA_VISITANTE',
      titulo: 'Visitante na portaria!',
      mensagem: `${dadosVisitante.nome_completo} está na portaria aguardando autorização.`,
      visitante: dadosVisitante,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notifica portaria quando o morador autoriza a entrada pelo aplicativo
   */
  notificarAutorizacaoMorador(dadosAutorizacao: any) {
    this.logger.log(`Emitindo 'visitante_autorizado' para [portaria_geral]`);
    this.server.to('portaria_geral').emit('visitante_autorizado', {
      tipo: 'AUTORIZACAO_CONCEDIDA',
      titulo: 'Entrada autorizada pelo morador!',
      autorizacao: dadosAutorizacao,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notifica a portaria e o morador quando uma encomenda é baixada/retirada
   */
  notificarRetiradaEncomenda(bloco: string, numero: string, encomendaId: string, retiradoPor: string) {
    const room = `unidade_${bloco}_${numero}`;
    const payload = {
      tipo: 'ENCOMENDA_RETIRADA',
      encomendaId,
      retiradoPor,
      timestamp: new Date().toISOString(),
    };

    if (this.server) {
      this.server.to(room).emit('encomenda_retirada', payload);
      this.server.to('portaria_geral').emit('encomenda_retirada', payload);
    }
  }

  /**
   * Emite evento de novo pacote cadastrado
   */
  emitNewPackage(entrega: any) {
    if (entrega?.unidade_bloco && entrega?.unidade_numero) {
      this.notificarNovaEncomenda(entrega.unidade_bloco, entrega.unidade_numero, entrega);
    } else if (this.server) {
      this.server.to('portaria_geral').emit('encomenda_chegou', {
        tipo: 'NOVA_ENCOMENDA',
        encomenda: entrega,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Emite mudança de status do pacote (ex: RETIRADO)
   */
  emitPackageStatusChange(id: string, status: string) {
    if (this.server) {
      this.server.to('portaria_geral').emit('encomenda_status_mudou', {
        id,
        status,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Emite novo agendamento de visita cadastrado
   */
  emitNewSchedule(agendamento: any) {
    if (this.server) {
      this.server.to('portaria_geral').emit('agendamento_criado', {
        tipo: 'NOVO_AGENDAMENTO',
        agendamento,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Emite alteração de status do agendamento (ex: EM_ANDAMENTO, CONCLUIDO)
   */
  emitScheduleStatusChange(id: string, status: string) {
    if (this.server) {
      this.server.to('portaria_geral').emit('agendamento_status_mudou', {
        id,
        status,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
