export type TipoUnidade = 'APARTAMENTO' | 'CASA' | 'SALA_COMERCIAL' | 'COBERTURA' | 'OUTRO';

export type StatusEntrega = 'AGUARDANDO_RETIRADA' | 'RETIRADO' | 'DEVOLVIDO' | 'EXTRAVIADO';

export type TipoVisitante = 'VISITANTE' | 'PRESTADOR_SERVICO' | 'ENTREGADOR' | 'CORRETOR' | 'OUTRO';

export interface Unidade {
  id: string;
  bloco: string;
  numero: string;
  tipo: TipoUnidade;
  moradores?: string[];
}

export interface Encomenda {
  id: string;
  unidade_id: string;
  unidade_bloco: string;
  unidade_numero: string;
  morador_nome: string;
  morador_telefone?: string;
  codigo_barras_qrcode: string;
  transportadora: string;
  codigo_rastreio?: string;
  descricao_pacote?: string;
  foto_comprovante_url?: string;
  foto_retirada_url?: string;
  status: StatusEntrega;
  data_recebimento: string;
  data_retirada?: string;
  retirado_por_nome?: string;
  retirado_por_documento?: string;
  porteiro_recebedor_nome: string;
}

export interface Visitante {
  id: string;
  nome_completo: string;
  cpf?: string;
  rg?: string;
  telefone?: string;
  foto_url?: string;
  tipo: TipoVisitante;
  empresa?: string;
  placa_veiculo?: string;
  unidade_destino_bloco?: string;
  unidade_destino_numero?: string;
  ativo: boolean;
  observacoes?: string;
  data_cadastro: string;
  hora_entrada?: string;
  status_acesso?: 'DENTRO' | 'LIBERADO' | 'CONCLUIDO';
}

export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  cor: string;
  tipo: 'CARRO' | 'MOTO' | 'BICICLETA' | 'OUTRO';
  vaga?: string;
}

export interface Dependente {
  id: string;
  nome: string;
  parentesco: string;
  data_nascimento?: string;
  cpf?: string;
}

export interface ContatoEmergencia {
  nome: string;
  telefone: string;
  parentesco: string;
}

export type PerfilUsuario = 'ADMINISTRADOR' | 'SINDICO' | 'PORTEIRO' | 'MORADOR' | 'PRESTADOR_SERVICO';

export interface Morador {
  id: string;
  unidade_id: string;
  unidade_bloco: string;
  unidade_numero: string;
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string;
  perfil: PerfilUsuario;
  status: 'ATIVO' | 'INATIVO' | 'BLOQUEADO' | 'PENDENTE_APROVACAO';
  is_responsavel_unidade: boolean;
  avatar_url?: string;
  data_cadastro: string;
  
  // Dados complementares
  veiculos: Veiculo[];
  dependentes: Dependente[];
  contatos_emergencia?: ContatoEmergencia[];
  observacoes?: string;

  // LGPD
  lgpd_termo_aceito: boolean;
  lgpd_data_aceite?: string;
  lgpd_anonimizado?: boolean;
}

export interface ComunicadoIA {
  id: string;
  titulo: string;
  tipo: 'ENCOMENDA' | 'MANUTENCAO' | 'ASSEMBLEIA' | 'SEGURANCA' | 'AVISO_GERAL';
  destinatarios: 'TODOS' | 'BLOCO' | 'UNIDADE_ESPECIFICA';
  bloco_alvo?: string;
  unidade_alvo?: string;
  mensagem: string;
  mensagem_whatsapp: string;
  criado_em: string;
  enviado: boolean;
}

