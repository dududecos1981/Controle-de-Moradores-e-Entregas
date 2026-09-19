import { Encomenda, Visitante, Unidade, Morador, ComunicadoIA, PrestadorServico, RegistroAcesso } from './types';

// Unidades base do condomínio
export const INITIAL_UNIDADES: Unidade[] = [
  { id: 'u-1', bloco: 'A', numero: '101', tipo: 'APARTAMENTO', moradores: [] },
  { id: 'u-2', bloco: 'A', numero: '102', tipo: 'APARTAMENTO', moradores: [] },
  { id: 'u-3', bloco: 'A', numero: '201', tipo: 'APARTAMENTO', moradores: [] },
  { id: 'u-4', bloco: 'B', numero: '101', tipo: 'APARTAMENTO', moradores: [] },
  { id: 'u-5', bloco: 'B', numero: 'PH01', tipo: 'COBERTURA', moradores: [] },
];

// Encomendas iniciais (Limpo)
export const INITIAL_ENCOMENDAS: Encomenda[] = [];

// Visitantes iniciais (Limpo)
export const INITIAL_VISITANTES: Visitante[] = [];

// Moradores e Residentes Iniciais (Limpo)
export const INITIAL_MORADORES: Morador[] = [];

// Comunicados IA Iniciais (Limpo)
export const INITIAL_COMUNICADOS: ComunicadoIA[] = [];

// Prestadores de Serviço Iniciais (Limpo)
export const INITIAL_PRESTADORES: PrestadorServico[] = [];

// Histórico de Últimos Acessos (Limpo)
export const INITIAL_ACESSOS: RegistroAcesso[] = [];
