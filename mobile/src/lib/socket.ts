import { io, Socket } from 'socket.io-client';

export function getSocketUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      const protocol = window.location.protocol;
      return `${protocol}//${host}:3000`;
    }
  }
  return envUrl || 'http://localhost:3000';
}

class MobileSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(bloco = 'A', unidade = '101') {
    if (typeof window === 'undefined') return;
    if (this.socket && this.socket.connected) return;

    const socketUrl = getSocketUrl();
    this.socket = io(`${socketUrl}/events`, {
      query: {
        perfil: 'MORADOR',
        bloco,
        unidade,
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('📱 [Mobile Socket] Conectado à sala da unidade:', `${bloco}-${unidade}`);
    });

    this.socket.on('encomenda_chegou', (data) => {
      this.emitLocal('encomenda_chegou', data);
    });

    this.socket.on('encomenda_retirada', (data) => {
      this.emitLocal('encomenda_retirada', data);
    });

    this.socket.on('visitante_chegou', (data) => {
      this.emitLocal('visitante_chegou', data);
    });

    this.socket.on('ocorrencia_respondida', (data) => {
      this.emitLocal('ocorrencia_respondida', data);
    });

    this.socket.on('reserva_atualizada', (data) => {
      this.emitLocal('reserva_atualizada', data);
    });
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
          console.error(`Erro no listener mobile ${event}:`, e);
        }
      });
    }
  }
}

export const mobileSocket = new MobileSocketService();
