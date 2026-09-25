const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
}

export interface UserSession {
  id: string;
  nome_completo: string;
  email: string;
  perfil: 'ADMINISTRADOR' | 'SINDICO' | 'PORTEIRO' | 'MORADOR';
  unidade_id?: string;
  unidade_bloco?: string;
  unidade_numero?: string;
}

class ApiService {
  private token: string | null = null;
  private currentUser: UserSession | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {
          this.currentUser = null;
        }
      }
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

  getToken(): string | null {
    return this.token;
  }

  setUser(user: UserSession | null) {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('auth_user');
      }
    }
  }

  getUser(): UserSession | null {
    if (!this.currentUser && typeof window !== 'undefined') {
      const saved = localStorage.getItem('auth_user');
      if (saved) {
        try {
          this.currentUser = JSON.parse(saved);
        } catch (e) {}
      }
    }
    return this.currentUser;
  }

  logout() {
    this.setToken(null);
    this.setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('portaria_auth_user');
      localStorage.removeItem('portaria_session');
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

  async deleteMorador(id: string) {
    return this.request<any>(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  }

  // Veículos
  async getVeiculos(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/veiculos${query ? `?${query}` : ''}`);
  }

  async getVeiculoByPlaca(placa: string) {
    return this.request<any>(`/veiculos/placa/${encodeURIComponent(placa)}`);
  }

  async createVeiculo(data: any) {
    return this.request<any>('/veiculos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVeiculo(id: string, data: any) {
    return this.request<any>(`/veiculos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVeiculo(id: string) {
    return this.request<any>(`/veiculos/${id}`, {
      method: 'DELETE',
    });
  }

  // Ocorrências & Manutenção
  async getOcorrencias(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/ocorrencias${query ? `?${query}` : ''}`);
  }

  async getOcorrenciaById(id: string) {
    return this.request<any>(`/ocorrencias/${id}`);
  }

  async createOcorrencia(data: any) {
    return this.request<any>('/ocorrencias', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async responderOcorrencia(id: string, data: { resposta_sindico: string; status: string }) {
    return this.request<any>(`/ocorrencias/${id}/responder`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Áreas Comuns & Reservas
  async getAreasComuns() {
    return this.request<any>('/reservas/areas');
  }

  async getReservas(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/reservas${query ? `?${query}` : ''}`);
  }

  async createReserva(data: any) {
    return this.request<any>('/reservas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReservaStatus(id: string, status: string) {
    return this.request<any>(`/reservas/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // LGPD & Auditoria
  async getAuditoriaLogs(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/lgpd/auditoria${query ? `?${query}` : ''}`);
  }

  async anonimizarMorador(id: string, motivo?: string) {
    return this.request<any>(`/lgpd/anonimizar/${id}`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    });
  }

  async executarExpurgoLGPD(dias?: number) {
    return this.request<any>(`/lgpd/executar-expurgo${dias ? `?dias=${dias}` : ''}`, {
      method: 'POST',
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
      if (res.user) {
        this.setUser(res.user);
      }
    }
    return res;
  }

  async register(data: {
    nome_completo: string;
    cpf: string;
    email: string;
    senha: string;
    telefone?: string;
    perfil?: string;
    unidade_id?: string;
    unidade_bloco?: string;
    unidade_numero?: string;
  }) {
    const res = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res?.accessToken) {
      this.setToken(res.accessToken);
      if (res.user) {
        this.setUser(res.user);
      }
    }
    return res;
  }

  async redefinirSenha(email: string, cpf: string, nova_senha: string) {
    return this.request<any>('/auth/redefinir-senha', {
      method: 'POST',
      body: JSON.stringify({ email, cpf, nova_senha }),
    });
  }
}

export const api = new ApiService();
