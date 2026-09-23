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

export type PerfilUsuario =
  | 'ADMINISTRADOR'
  | 'GERENTE'
  | 'SINDICO'
  | 'ZELADOR'
  | 'PORTEIRO'
  | 'OUTRO'
  | 'MORADOR'
  | 'PRESTADOR_SERVICO';

export type CargoColaborador =
  | 'ADMINISTRADOR'
  | 'GERENTE'
  | 'SINDICO'
  | 'ZELADOR'
  | 'PORTEIRO'
  | 'OUTRO';

export type TurnoTrabalho =
  | 'COMERCIAL'
  | 'MANHA'
  | 'TARDE'
  | 'NOITE'
  | '12X36'
  | 'OUTRO';

export interface Colaborador {
  id: string;
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: CargoColaborador;
  turno: TurnoTrabalho;
  status: 'ATIVO' | 'INATIVO' | 'FERIAS' | 'BLOQUEADO';
  matricula?: string;
  foto_url?: string;
  data_admissao: string;
  observacoes?: string;
  lgpd_termo_aceito?: boolean;
}

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

export type TipoPessoaAcesso = 'MORADOR' | 'VISITANTE' | 'PRESTADOR_SERVICO';
export type TipoMovimentacao = 'ENTRADA' | 'SAIDA';
export type MetodoValidacao =
  | 'BIOMETRIA_FACIAL'
  | 'TAG_VEICULAR'
  | 'QR_CODE'
  | 'PORTARIA_MANUAL'
  | 'LEITOR_PLACA'
  | 'SENHA_INTERFONE';

export interface RegistroAcesso {
  id: string;
  tipo_pessoa: TipoPessoaAcesso;
  nome: string;
  documento?: string;
  unidade_bloco: string;
  unidade_numero: string;
  foto_url?: string;
  tipo_movimentacao: TipoMovimentacao;
  data_hora: string;
  metodo_validacao: MetodoValidacao;
  veiculo_placa?: string;
  veiculo_modelo?: string;
  empresa?: string;
  servico_descricao?: string;
  autorizado_por?: string;
  porteiro_responsavel?: string;
  observacoes?: string;
}

export interface PrestadorServico {
  id: string;
  nome_completo: string;
  cpf?: string;
  rg?: string;
  telefone?: string;
  empresa: string;
  especialidade: string;
  foto_url?: string;
  placa_veiculo?: string;
  modelo_veiculo?: string;
  unidade_destino_bloco: string;
  unidade_destino_numero: string;
  morador_responsavel?: string;
  status_acesso: 'DENTRO' | 'LIBERADO' | 'CONCLUIDO';
  hora_entrada?: string;
  hora_saida?: string;
  data_cadastro: string;
  cracha_numero?: string;
  observacoes?: string;
}

export type CategoriaOcorrencia = 'BARULHO' | 'MANUTENCAO' | 'SEGURANCA' | 'LIMPEZA' | 'CONVIVENCIA' | 'GARAGEM' | 'OUTRO';
export type StatusOcorrencia = 'ABERTO' | 'EM_ANALISE' | 'EM_ANDAMENTO' | 'RESOLVIDO' | 'CANCELADO';

export interface Ocorrencia {
  id: string;
  unidade_id: string;
  unidade_bloco: string;
  unidade_numero: string;
  usuario_id: string;
  solicitante_nome: string;
  solicitante_telefone?: string;
  solicitante_email?: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaOcorrencia;
  foto_url?: string;
  status: StatusOcorrencia;
  resposta_sindico?: string;
  respondido_por_id?: string;
  respondido_por_nome?: string;
  respondido_em?: string;
  created_at: string;
  updated_at?: string;
}

export interface AreaComum {
  id: string;
  nome: string;
  descricao?: string;
  capacidade_maxima: number;
  taxa_reserva: number;
  foto_url?: string;
  regras?: string;
  status: 'DISPONIVEL' | 'MANUTENCAO' | 'EM_MANUTENCAO' | 'BLOQUEADO' | 'INDISPONIVEL';
}

export type PeriodoReserva = 'MANHA' | 'TARDE' | 'NOITE' | 'INTEGRAL';
export type StatusReserva = 'SOLICITADO' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO';

export interface ReservaArea {
  id: string;
  area_id: string;
  area_nome: string;
  area_foto?: string;
  area_capacidade?: number;
  area_taxa?: number;
  unidade_id: string;
  unidade_bloco: string;
  unidade_numero: string;
  usuario_id: string;
  solicitante_nome: string;
  solicitante_telefone?: string;
  data_reserva: string;
  periodo: PeriodoReserva;
  status: StatusReserva;
  convidados_estimados?: number;
  observacoes?: string;
  created_at: string;
}

export interface VeiculoCompleto {
  id: string;
  unidade_id: string;
  unidade_bloco: string;
  unidade_numero: string;
  usuario_id?: string;
  proprietario_nome?: string;
  proprietario_telefone?: string;
  placa: string;
  marca_modelo: string;
  cor?: string;
  tipo: 'CARRO' | 'MOTO' | 'BICICLETA' | 'CAMINHAO' | 'PATINETE' | 'OUTRO';
  vaga_garagem?: string;
  ativo: boolean;
  observacoes?: string;
  created_at: string;
}

export interface LogAuditoriaLGPD {
  id: string;
  tabela: string;
  operacao: 'INSERT' | 'UPDATE' | 'DELETE' | 'ANONIMIZACAO_LGPD';
  registro_id: string;
  usuario_responsavel_id?: string;
  usuario_responsavel_nome?: string;
  usuario_responsavel_email?: string;
  usuario_contexto?: string;
  ip_origem?: string;
  dados_anteriores?: any;
  dados_novos?: any;
  campos_alterados?: string[];
  motivo_operacao?: string;
  created_at: string;
}



