const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
