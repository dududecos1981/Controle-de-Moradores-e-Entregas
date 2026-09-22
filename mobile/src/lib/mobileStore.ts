import {
  EncomendaMorador,
  ConviteVisitante,
  MoradorPerfil,
  OcorrenciaMorador,
  AreaComumMorador,
  ReservaMorador,
  VeiculoMorador,
} from './types';

export const CURRENT_MORADOR: MoradorPerfil = {
  id: 'usr-morador-01',
  nome: 'Morador',
  email: '',
  telefone: '',
  bloco: 'A',
  apartamento: '101',
  condominio_nome: 'Condomínio Residencial',
};

// Encomendas do Morador (Limpo)
export const INITIAL_MORADOR_ENCOMENDAS: EncomendaMorador[] = [];

// Convites e Agendamentos (Limpo)
export const INITIAL_CONVITES: ConviteVisitante[] = [];

// Ocorrências do Morador (Limpo)
export const INITIAL_OCORRENCIAS_MORADOR: OcorrenciaMorador[] = [];

// Áreas Comuns do Condomínio (Configuráveis)
export const INITIAL_AREAS_MORADOR: AreaComumMorador[] = [
  {
    id: 'area-01',
    nome: 'Espaço Gourmet & Churrasqueira',
    descricao: 'Espaço climatizado com churrasqueira a carvão, freezer e mesas.',
    foto_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    regras: 'Horário de uso e normas conforme regimento interno.',
  },
  {
    id: 'area-02',
    nome: 'Salão Nobre de Festas',
    descricao: 'Salão amplo com sistema de som integrado e cozinha de apoio.',
    foto_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    regras: 'Reserva e autorização gerenciadas pela administração.',
  },
  {
    id: 'area-03',
    nome: 'Quadra Poliesportiva & Beach Tennis',
    descricao: 'Quadra iluminada para futebol e esportes de areia.',
    foto_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    regras: 'Uso compartilhado e agendamento por turnos.',
  },
];

// Reservas do Morador (Limpo)
export const INITIAL_RESERVAS_MORADOR: ReservaMorador[] = [];

// Veículos do Morador (Limpo)
export const INITIAL_VEICULOS_MORADOR: VeiculoMorador[] = [];
