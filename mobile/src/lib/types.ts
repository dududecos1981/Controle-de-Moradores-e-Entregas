export interface EncomendaMorador {
  id: string;
  codigo_barras_qrcode: string;
  transportadora: string;
  codigo_rastreio?: string;
  descricao_pacote?: string;
  foto_comprovante_url?: string;
  status: 'AGUARDANDO_RETIRADA' | 'RETIRADO';
  data_recebimento: string;
  data_retirada?: string;
  retirado_por_nome?: string;
  retirado_por_documento?: string;
  porteiro_recebedor_nome: string;
  assinatura_digital_url?: string;
}

export interface ConviteVisitante {
  id: string;
  nome_convidado: string;
  documento?: string;
  tipo_visita: 'VISITA' | 'FESTA_EVENTO' | 'PRESTADOR_SERVICO' | 'ENTREGA';
  data_valida: string;
  hora_inicio: string;
  hora_fim: string;
  qr_code_token: string;
  status: 'ATIVO' | 'UTILIZADO' | 'EXPIRADO';
  created_at: string;
  observacoes?: string;
}

export interface MoradorPerfil {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  bloco: string;
  apartamento: string;
  condominio_nome: string;
}

export interface OcorrenciaMorador {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'BARULHO' | 'MANUTENCAO' | 'SEGURANCA' | 'LIMPEZA' | 'GARAGEM' | 'OUTRO';
  foto_url?: string;
  status: 'ABERTO' | 'EM_ANDAMENTO' | 'RESOLVIDO' | 'CANCELADO';
  resposta_sindico?: string;
  respondido_em?: string;
  created_at: string;
}

export interface AreaComumMorador {
  id: string;
  nome: string;
  descricao: string;
  capacidade_maxima?: number;
  taxa_reserva?: number;
  foto_url?: string;
  regras?: string;
}

export interface ReservaMorador {
  id: string;
  area_id: string;
  area_nome: string;
  data_reserva: string;
  periodo: 'MANHA' | 'TARDE' | 'NOITE' | 'INTEGRAL';
  status: 'SOLICITADO' | 'CONFIRMADO' | 'CANCELADO';
  convidados_estimados?: number;
  observacoes?: string;
  created_at: string;
}

export interface VeiculoMorador {
  id: string;
  placa: string;
  marca_modelo: string;
  cor: string;
  tipo: 'CARRO' | 'MOTO' | 'BICICLETA' | 'OUTRO';
  vaga_garagem?: string;
}
