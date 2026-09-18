const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
    }

    return response.json();
  }

  // Unidades
  async getUnidades(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/unidades${query ? `?${query}` : ''}`);
  }

  // Encomendas & Entregas
  async getEntregas(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/entregas${query ? `?${query}` : ''}`);
  }

  async getEntregaMetricas() {
    return this.request<any>('/entregas/metricas');
  }

  async createEntrega(data: any) {
    return this.request<any>('/entregas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async retirarEntrega(id: string, data: { retirado_por_nome: string; retirado_por_documento?: string }) {
    return this.request<any>(`/entregas/${id}/retirar`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Visitantes
  async getVisitantes(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/visitantes${query ? `?${query}` : ''}`);
  }

  async createVisitante(data: any) {
    return this.request<any>('/visitantes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Agendamentos
  async getAgendamentos(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/agendamentos${query ? `?${query}` : ''}`);
  }

  async createAgendamento(data: any) {
    return this.request<any>('/agendamentos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Moradores & Usuários
  async getMoradores(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/usuarios${query ? `?${query}` : ''}`);
  }

  async createMorador(data: any) {
    return this.request<any>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMorador(id: string, data: any) {
    return this.request<any>(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async anonimizarMorador(id: string, motivo?: string) {
    return this.request<any>(`/lgpd/anonimizar/${id}`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    });
  }

  async deleteMorador(id: string) {
    return this.request<any>(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  }

  // Inteligência Artificial & Comunicados
  async gerarComunicadoIA(promptData: {
    tipo: string;
    destinatarios: string;
    bloco?: string;
    unidade?: string;
    detalhes: string;
    tom?: string;
  }) {
    // Chamada à API Route interna de IA (Next.js server-side)
    const response = await fetch('/api/ia/gerar-comunicado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptData),
    });
    if (!response.ok) {
      throw new Error('Falha ao gerar comunicado com IA');
    }
    return response.json();
  }

  // Autenticação
  async login(email: string, senha: string) {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    if (res?.accessToken) {
      this.setToken(res.accessToken);
    }
    return res;
  }
}

export const api = new ApiService();

