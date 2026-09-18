import { Encomenda, Visitante, Unidade } from './types';

// Unidades iniciais do condomínio
export const INITIAL_UNIDADES: Unidade[] = [
  { id: 'u-1', bloco: 'A', numero: '101', tipo: 'APARTAMENTO', moradores: ['Mariana Fernandes', 'Gabriel Fernandes'] },
  { id: 'u-2', bloco: 'A', numero: '102', tipo: 'APARTAMENTO', moradores: ['Juliana Moreira'] },
  { id: 'u-3', bloco: 'A', numero: '201', tipo: 'APARTAMENTO', moradores: ['Rodrigo Vasconcelos', 'Beatriz Lima'] },
  { id: 'u-4', bloco: 'B', numero: '101', tipo: 'APARTAMENTO', moradores: ['Felipe Antunes'] },
  { id: 'u-5', bloco: 'B', numero: 'PH01', tipo: 'COBERTURA', moradores: ['Roberto Albuquerque (Síndico)'] },
];

// Encomendas iniciais
export const INITIAL_ENCOMENDAS: Encomenda[] = [
  {
    id: 'enc-1',
    unidade_id: 'u-1',
    unidade_bloco: 'A',
    unidade_numero: '101',
    morador_nome: 'Mariana Fernandes',
    morador_telefone: '(11) 96543-2109',
    codigo_barras_qrcode: 'PKG-AMZ-789456123BR',
    transportadora: 'Amazon Logística',
    codigo_rastreio: 'BR789456123AMZ',
    descricao_pacote: 'Caixa Média (Eletrônicos)',
    foto_comprovante_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60',
    status: 'AGUARDANDO_RETIRADA',
    data_recebimento: new Date(Date.now() - 3600000 * 2).toISOString(),
    porteiro_recebedor_nome: 'João Portaria',
  },
  {
    id: 'enc-2',
    unidade_id: 'u-5',
    unidade_bloco: 'B',
    unidade_numero: 'PH01',
    morador_nome: 'Roberto Albuquerque',
    morador_telefone: '(11) 95432-1098',
    codigo_barras_qrcode: 'PKG-ML-987654321BR',
    transportadora: 'Mercado Livre Express',
    codigo_rastreio: 'MLB987654321',
    descricao_pacote: 'Envelope Documento Urgente',
    foto_comprovante_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60',
    status: 'AGUARDANDO_RETIRADA',
    data_recebimento: new Date(Date.now() - 3600000 * 5).toISOString(),
    porteiro_recebedor_nome: 'João Portaria',
  },
  {
    id: 'enc-3',
    unidade_id: 'u-3',
    unidade_bloco: 'A',
    unidade_numero: '201',
    morador_nome: 'Rodrigo Vasconcelos',
    morador_telefone: '(11) 94321-0987',
    codigo_barras_qrcode: 'PKG-SHP-112233445BR',
    transportadora: 'Shopee Express',
    codigo_rastreio: 'SHP112233445',
    descricao_pacote: 'Pacote Roupas / Vestuário',
    status: 'RETIRADO',
    data_recebimento: new Date(Date.now() - 3600000 * 24).toISOString(),
    data_retirada: new Date(Date.now() - 3600000 * 3).toISOString(),
    retirado_por_nome: 'Rodrigo Vasconcelos (Titular)',
    retirado_por_documento: '44.555.666-7',
    porteiro_recebedor_nome: 'Carlos Plantão',
  },
  {
    id: 'enc-4',
    unidade_id: 'u-2',
    unidade_bloco: 'A',
    unidade_numero: '102',
    morador_nome: 'Juliana Moreira',
    morador_telefone: '(11) 93210-9876',
    codigo_barras_qrcode: 'PKG-COR-556677889BR',
    transportadora: 'Correios (Sedex)',
    codigo_rastreio: 'SZ556677889BR',
    descricao_pacote: 'Caixa Pequena Farmácia',
    status: 'AGUARDANDO_RETIRADA',
    data_recebimento: new Date(Date.now() - 3600000 * 8).toISOString(),
    porteiro_recebedor_nome: 'João Portaria',
  }
];

// Visitantes iniciais
export const INITIAL_VISITANTES: Visitante[] = [
  {
    id: 'vis-1',
    nome_completo: 'Lucas Mendes de Oliveira',
    cpf: '555.666.777-88',
    telefone: '(11) 98888-7777',
    foto_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    tipo: 'VISITANTE',
    unidade_destino_bloco: 'A',
    unidade_destino_numero: '101',
    placa_veiculo: 'BRA2E19',
    ativo: true,
    status_acesso: 'DENTRO',
    data_cadastro: new Date(Date.now() - 3600000 * 2).toISOString(),
    hora_entrada: '14:30',
    observacoes: 'Familiar da moradora Mariana (autorizado para almoço)',
  },
  {
    id: 'vis-2',
    nome_completo: 'Paulo Santos (Eletricista)',
    cpf: '666.777.888-99',
    telefone: '(11) 97777-6666',
    foto_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    tipo: 'PRESTADOR_SERVICO',
    empresa: 'EletroFix Instalações',
    unidade_destino_bloco: 'B',
    unidade_destino_numero: 'PH01',
    placa_veiculo: 'ABC1D23',
    ativo: true,
    status_acesso: 'DENTRO',
    data_cadastro: new Date(Date.now() - 3600000 * 4).toISOString(),
    hora_entrada: '11:15',
    observacoes: 'Manutenção de quadro de disjuntores da cobertura',
  },
  {
    id: 'vis-3',
    nome_completo: 'Bruno Entregador',
    telefone: '(11) 96666-5555',
    foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    tipo: 'ENTREGADOR',
    empresa: 'iFood / Mercado Pago',
    placa_veiculo: 'XYZ9K88',
    ativo: true,
    status_acesso: 'CONCLUIDO',
    data_cadastro: new Date(Date.now() - 3600000 * 6).toISOString(),
    hora_entrada: '10:00',
    observacoes: 'Entrega rápida de refeição',
  }
];

import { Morador, ComunicadoIA } from './types';

// Moradores e Residentes Iniciais
export const INITIAL_MORADORES: Morador[] = [
  {
    id: 'mor-1',
    unidade_id: 'u-1',
    unidade_bloco: 'A',
    unidade_numero: '101',
    nome_completo: 'Mariana Fernandes',
    cpf: '123.456.789-00',
    email: 'mariana.fernandes@condominio.com',
    telefone: '(11) 96543-2109',
    perfil: 'MORADOR',
    status: 'ATIVO',
    is_responsavel_unidade: true,
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    data_cadastro: '2025-01-10T10:00:00Z',
    veiculos: [
      { id: 'v-1', placa: 'ABC1E23', modelo: 'Jeep Compass', cor: 'Cinza Grafite', tipo: 'CARRO', vaga: 'V-101A' },
      { id: 'v-2', placa: 'XYZ9K88', modelo: 'Honda PCX 150', cor: 'Branca', tipo: 'MOTO', vaga: 'M-12' }
    ],
    dependentes: [
      { id: 'dep-1', nome: 'Gabriel Fernandes', parentesco: 'Cônjuge', cpf: '234.567.890-11' },
      { id: 'dep-2', nome: 'Sofia Fernandes', parentesco: 'Filha', data_nascimento: '2018-05-14' }
    ],
    contatos_emergencia: [
      { nome: 'Carlos Fernandes (Pai)', telefone: '(11) 98888-1122', parentesco: 'Pai' }
    ],
    observacoes: 'Permissão permanente de entrada para entregas e delivery com aviso no app.',
    lgpd_termo_aceito: true,
    lgpd_data_aceite: '2025-01-10T10:05:00Z',
    lgpd_anonimizado: false
  },
  {
    id: 'mor-2',
    unidade_id: 'u-5',
    unidade_bloco: 'B',
    unidade_numero: 'PH01',
    nome_completo: 'Roberto Albuquerque',
    cpf: '345.678.901-22',
    email: 'sindico.roberto@condominio.com',
    telefone: '(11) 95432-1098',
    perfil: 'SINDICO',
    status: 'ATIVO',
    is_responsavel_unidade: true,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    data_cadastro: '2024-06-15T09:30:00Z',
    veiculos: [
      { id: 'v-3', placa: 'ROB8B88', modelo: 'BMW 320i', cor: 'Azul Marinho', tipo: 'CARRO', vaga: 'PH-01' }
    ],
    dependentes: [
      { id: 'dep-3', nome: 'Helena Albuquerque', parentesco: 'Cônjuge' }
    ],
    contatos_emergencia: [
      { nome: 'Escritório Advocacia Albuquerque', telefone: '(11) 3333-4444', parentesco: 'Comercial' }
    ],
    observacoes: 'Síndico Geral do Condomínio. Acesso a relatórios administrativos.',
    lgpd_termo_aceito: true,
    lgpd_data_aceite: '2024-06-15T09:35:00Z',
    lgpd_anonimizado: false
  },
  {
    id: 'mor-3',
    unidade_id: 'u-3',
    unidade_bloco: 'A',
    unidade_numero: '201',
    nome_completo: 'Rodrigo Vasconcelos',
    cpf: '456.789.012-33',
    email: 'rodrigo.vasc@empresa.com.br',
    telefone: '(11) 94321-0987',
    perfil: 'MORADOR',
    status: 'ATIVO',
    is_responsavel_unidade: true,
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    data_cadastro: '2025-02-01T14:20:00Z',
    veiculos: [
      { id: 'v-4', placa: 'VAS2C34', modelo: 'Toyota Corolla Cross', cor: 'Prata', tipo: 'CARRO', vaga: 'V-201A' }
    ],
    dependentes: [
      { id: 'dep-4', nome: 'Beatriz Lima', parentesco: 'Noiva' }
    ],
    observacoes: 'Possui cão de pequeno porte (Poodle).',
    lgpd_termo_aceito: true,
    lgpd_data_aceite: '2025-02-01T14:25:00Z',
    lgpd_anonimizado: false
  },
  {
    id: 'mor-4',
    unidade_id: 'u-2',
    unidade_bloco: 'A',
    unidade_numero: '102',
    nome_completo: 'Juliana Moreira',
    cpf: '567.890.123-44',
    email: 'juliana.moreira@design.art',
    telefone: '(11) 93210-9876',
    perfil: 'MORADOR',
    status: 'ATIVO',
    is_responsavel_unidade: true,
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    data_cadastro: '2025-03-05T16:00:00Z',
    veiculos: [],
    dependentes: [],
    observacoes: 'Home office frequente. Recebe muitas entregas de materiais de design.',
    lgpd_termo_aceito: true,
    lgpd_data_aceite: '2025-03-05T16:05:00Z',
    lgpd_anonimizado: false
  }
];

// Comunicados IA Iniciais
export const INITIAL_COMUNICADOS: ComunicadoIA[] = [
  {
    id: 'com-1',
    titulo: 'Manutenção Preventiva de Elevadores - Bloco A',
    tipo: 'MANUTENCAO',
    destinatarios: 'BLOCO',
    bloco_alvo: 'A',
    mensagem: 'Informamos a todos os moradores do Bloco A que na próxima terça-feira (22/09), das 09h às 12h, os elevadores passarão por manutenção técnica preventiva de rotina. Contamos com a compreensão de todos.',
    mensagem_whatsapp: '🏢 *CONDOMÍNIO RESIDENCIAL PRO*\n\n⚠️ *Aviso de Manutenção de Elevadores (Bloco A)*\n\n📅 Data: Terça-feira (22/09)\n⏰ Horário: 09:00 às 12:00\n📍 Local: Elevadores Sociais Bloco A\n\nPedimos a colaboração de todos durante o período de inspeção técnica.',
    criado_em: new Date(Date.now() - 3600000 * 24).toISOString(),
    enviado: true
  },
  {
    id: 'com-2',
    titulo: 'Lembrete de Retirada de Encomendas na Portaria',
    tipo: 'ENCOMENDA',
    destinatarios: 'TODOS',
    mensagem: 'Atenção moradores: temos diversos pacotes e encomendas aguardando retirada na portaria principal. Por favor, apresentem o código de retirada no app ou documento com foto para liberar espaço nos armários.',
    mensagem_whatsapp: '📦 *AVISO DA PORTARIA - ENCOMENDAS PENDENTES*\n\nPrezados moradores,\nIdentificamos pacotes aguardando retirada na portaria.\nSolicitamos a gentileza de comparecer com seu QR Code no App Morador para retirada.\n\nObrigado!',
    criado_em: new Date(Date.now() - 3600000 * 5).toISOString(),
    enviado: false
  }
];

