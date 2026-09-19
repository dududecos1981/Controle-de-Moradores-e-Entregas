import { EncomendaMorador, ConviteVisitante, MoradorPerfil } from './types';

export const CURRENT_MORADOR: MoradorPerfil = {
  id: 'usr-morador-atual',
  nome: 'Morador Residente',
  email: 'morador@condominio.com',
  telefone: '(11) 99999-9999',
  bloco: 'A',
  apartamento: '101',
  condominio_nome: 'Condomínio Residencial',
};

// Encomendas do morador (Limpo)
export const INITIAL_MORADOR_ENCOMENDAS: EncomendaMorador[] = [];

// Convites criados pelo morador (Limpo)
export const INITIAL_CONVITES: ConviteVisitante[] = [];
