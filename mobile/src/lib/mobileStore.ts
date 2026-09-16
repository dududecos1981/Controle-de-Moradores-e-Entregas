import { EncomendaMorador, ConviteVisitante, MoradorPerfil } from './types';

export const CURRENT_MORADOR: MoradorPerfil = {
  id: 'usr-mariana-101',
  nome: 'Mariana Fernandes',
  email: 'mariana.fernandes@email.com',
  telefone: '(11) 96543-2109',
  bloco: 'A',
  apartamento: '101',
  condominio_nome: 'Condomínio Residencial Jardins',
};

export const INITIAL_MORADOR_ENCOMENDAS: EncomendaMorador[] = [
  {
    id: 'enc-1',
    codigo_barras_qrcode: 'PKG-AMZ-789456123BR',
    transportadora: 'Amazon Logística',
    codigo_rastreio: 'BR789456123AMZ',
    descricao_pacote: 'Caixa Média (Fone de Ouvido Bluetooth)',
    foto_comprovante_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60',
    status: 'AGUARDANDO_RETIRADA',
    data_recebimento: new Date(Date.now() - 3600000 * 2).toISOString(),
    porteiro_recebedor_nome: 'João Portaria',
  },
  {
    id: 'enc-2',
    codigo_barras_qrcode: 'PKG-ML-445566778BR',
    transportadora: 'Mercado Livre Express',
    codigo_rastreio: 'MLB445566778',
    descricao_pacote: 'Pacote Roupas / Vestuário',
    foto_comprovante_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60',
    status: 'AGUARDANDO_RETIRADA',
    data_recebimento: new Date(Date.now() - 3600000 * 6).toISOString(),
    porteiro_recebedor_nome: 'Carlos Plantão',
  },
  {
    id: 'enc-3',
    codigo_barras_qrcode: 'PKG-COR-112233445BR',
    transportadora: 'Correios (Sedex)',
    codigo_rastreio: 'SZ112233445BR',
    descricao_pacote: 'Documentos e Livros',
    status: 'RETIRADO',
    data_recebimento: new Date(Date.now() - 3600000 * 48).toISOString(),
    data_retirada: new Date(Date.now() - 3600000 * 20).toISOString(),
    retirado_por_nome: 'Mariana Fernandes',
    retirado_por_documento: '33.444.555-6',
    porteiro_recebedor_nome: 'João Portaria',
  },
];

export const INITIAL_CONVITES: ConviteVisitante[] = [
  {
    id: 'cnv-1',
    nome_convidado: 'Lucas Mendes de Oliveira',
    tipo_visita: 'VISITA',
    data_valida: new Date().toISOString().split('T')[0],
    hora_inicio: '12:00',
    hora_fim: '18:00',
    qr_code_token: 'QR-VISITA-2026-LUCAS-APT101',
    status: 'ATIVO',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    observacoes: 'Almoço de família',
  },
  {
    id: 'cnv-2',
    nome_convidado: 'Eletricista Paulo (EletroFix)',
    documento: '23.456.789-0',
    tipo_visita: 'PRESTADOR_SERVICO',
    data_valida: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    hora_inicio: '09:00',
    hora_fim: '13:00',
    qr_code_token: 'QR-MANUTENCAO-2026-PAULO-APT101',
    status: 'ATIVO',
    created_at: new Date().toISOString(),
    observacoes: 'Instalação de luminárias na sala',
  },
];
