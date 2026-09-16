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
