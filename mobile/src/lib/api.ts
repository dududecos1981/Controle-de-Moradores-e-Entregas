export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Se o morador estiver acessando via celular na rede Wi-Fi / IP local
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      const protocol = window.location.protocol;
      return `${protocol}//${host}:3000/api`;
    }
  }
  return envUrl || 'http://localhost:3000/api';
}

export interface MobileUserSession {
  id: string;
  nome_completo?: string;
  nome?: string;
  email: string;
  cpf?: string;
  telefone?: string;
  bloco?: string;
  apartamento?: string;
  unidade_bloco?: string;
  unidade_numero?: string;
  perfil?: string;
}

class MobileApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('morador_auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('morador_auth_token', token);
      } else {
        localStorage.removeItem('morador_auth_token');
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

    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
    }

    return response.json();
  }

  // Encomendas do Morador
  async getEntregas(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/entregas${query ? `?${query}` : ''}`);
  }

  async retirarEntrega(id: string, data: { retirado_por_nome: string; retirado_por_documento?: string; assinatura_digital_url?: string }) {
    return this.request<any>(`/entregas/${id}/retirar`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Visitantes & Convites
  async getVisitantes(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/visitantes${query ? `?${query}` : ''}`);
  }

  async createConvite(data: {
    nome_completo: string;
    cpf?: string;
    telefone?: string;
    tipo?: string;
    placa_veiculo?: string;
    unidade_destino_bloco?: string;
    unidade_destino_numero?: string;
    observacoes?: string;
  }) {
    return this.request<any>('/visitantes', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        tipo: data.tipo || 'VISITANTE',
        ativo: true,
      }),
    });
  }

  // Ocorrências
  async getOcorrencias(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/ocorrencias${query ? `?${query}` : ''}`);
  }

  async createOcorrencia(data: {
    titulo: string;
    descricao: string;
    categoria?: string;
    unidade_bloco?: string;
    unidade_numero?: string;
    foto_url?: string;
  }) {
    return this.request<any>('/ocorrencias', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reservas & Áreas Comuns
  async getAreasComuns() {
    return this.request<any>('/reservas/areas');
  }

  async getReservas(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/reservas${query ? `?${query}` : ''}`);
  }

  async createReserva(data: {
    area_id: string;
    data_reserva: string;
    periodo?: string;
    unidade_bloco?: string;
    unidade_numero?: string;
    convidados_estimados?: number;
    observacoes?: string;
  }) {
    return this.request<any>('/reservas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Veículos
  async getVeiculos(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/veiculos${query ? `?${query}` : ''}`);
  }

  async createVeiculo(data: {
    placa: string;
    marca_modelo: string;
    cor?: string;
    tipo?: string;
    unidade_bloco?: string;
    unidade_numero?: string;
    vaga_garagem?: string;
    observacoes?: string;
  }) {
    return this.request<any>('/veiculos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  async register(data: {
    nome_completo: string;
    cpf: string;
    email: string;
    senha: string;
    telefone?: string;
    perfil?: string;
    unidade_bloco?: string;
    unidade_numero?: string;
  }) {
    const res = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res?.accessToken) {
      this.setToken(res.accessToken);
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

export const mobileApi = new MobileApiService();
