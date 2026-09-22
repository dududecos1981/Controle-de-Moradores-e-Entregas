import { io, Socket } from 'socket.io-client';
import { sounds } from './SoundEffects';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(params: { perfil?: string; bloco?: string; unidade?: string; userId?: string } = {}) {
    if (typeof window === 'undefined') return;
    if (this.socket && this.socket.connected) return;

    this.socket = io(`${SOCKET_SERVER_URL}/events`, {
      query: {
        perfil: params.perfil || 'PORTEIRO',
        bloco: params.bloco || '',
        unidade: params.unidade || '',
        userId: params.userId || '',
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('📡 [WebSocket] Conectado ao servidor de eventos em tempo real:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('🔌 [WebSocket] Desconectado do servidor de eventos');
    });

    this.socket.on('connect_error', (err) => {
      this.isConnected = false;
      console.warn('⚠️ [WebSocket] Erro de conexão (operando em modo local):', err.message);
    });

    // Eventos principais da portaria
    this.socket.on('encomenda_chegou', (data) => {
      sounds.playSuccessChime();
      this.emitLocal('encomenda_chegou', data);
    });

    this.socket.on('feed_atualizado', (data) => {
      this.emitLocal('feed_atualizado', data);
    });

    this.socket.on('visitante_chegou', (data) => {
      sounds.playSuccessChime();
      this.emitLocal('visitante_chegou', data);
    });

    this.socket.on('ocorrencia_criada', (data) => {
      sounds.playSuccessChime();
      this.emitLocal('ocorrencia_criada', data);
    });

    this.socket.on('reserva_criada', (data) => {
      this.emitLocal('reserva_criada', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emitLocal(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Erro no listener do evento ${event}:`, e);
        }
      });
    }
  }

  getConnected(): boolean {
    return this.isConnected;
  }
}

export const socketService = new SocketService();
