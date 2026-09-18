-- ==============================================================================
-- PROJETO: Sistema de Gestão de Portaria, Pessoas e Entregas
-- BANCO DE DADOS: PostgreSQL (Neon Serverless)
-- ARQUIVO: seed.sql (Dados de Homologação & Demonstração)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. UNIDADES
-- ------------------------------------------------------------------------------
INSERT INTO unidades (id, bloco, numero, tipo, status, andar, observacoes) VALUES
('a0000000-0000-0000-0000-000000000001', 'A', '101', 'APARTAMENTO', 'ATIVO', 1, 'Apartamento térreo frente'),
('a0000000-0000-0000-0000-000000000002', 'A', '102', 'APARTAMENTO', 'ATIVO', 1, 'Apartamento térreo fundos'),
('a0000000-0000-0000-0000-000000000003', 'A', '201', 'APARTAMENTO', 'ATIVO', 2, 'Apartamento 2º andar'),
('a0000000-0000-0000-0000-000000000004', 'B', '101', 'APARTAMENTO', 'ATIVO', 1, 'Torre B'),
('a0000000-0000-0000-0000-000000000005', 'B', 'PH01', 'COBERTURA', 'ATIVO', 12, 'Cobertura duplex')
ON CONFLICT (bloco, numero) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. USUÁRIOS (ADMIN, PORTEIRO, SÍNDICO, MORADORES)
-- ------------------------------------------------------------------------------
-- Senha de teste padrão: "SenhaSegura123!" (hash bcrypt válido)
INSERT INTO usuarios (
    id,
    unidade_id,
    nome_completo,
    cpf,
    email,
    senha_hash,
    telefone,
    perfil,
    status,
    is_responsavel_unidade,
    lgpd_termo_aceito,
    lgpd_data_aceite,
    lgpd_versao_termo,
    lgpd_ip_aceite
) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    NULL,
    'Carlos Silva (Administrador Geral)',
    '111.222.333-44',
    'admin@condominio.com.br',
    '$2a$10$6C5kaiBO/rd5GE8HQGW/EOJZFAJpfQ8VVR.GOG1he29jOWII2yAk2',
    '11987654321',
    'ADMINISTRADOR',
    'ATIVO',
    FALSE,
    TRUE,
    clock_timestamp(),
    '1.0',
    '192.168.1.10'
),
(
    'b0000000-0000-0000-0000-000000000002',
    NULL,
    'João Portaria (Plantão Diurno)',
    '222.333.444-55',
    'porteiro.joao@condominio.com.br',
    '$2a$10$6C5kaiBO/rd5GE8HQGW/EOJZFAJpfQ8VVR.GOG1he29jOWII2yAk2',
    '11976543210',
    'PORTEIRO',
    'ATIVO',
    FALSE,
    TRUE,
    clock_timestamp(),
    '1.0',
    '192.168.1.15'
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Mariana Fernandes (Moradora Titular)',
    '333.444.555-66',
    'mariana.fernandes@email.com',
    '$2a$10$6C5kaiBO/rd5GE8HQGW/EOJZFAJpfQ8VVR.GOG1he29jOWII2yAk2',
    '11965432109',
    'MORADOR',
    'ATIVO',
    TRUE,
    TRUE,
    clock_timestamp(),
    '1.0',
    '177.12.34.56'
),
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000005',
    'Roberto Albuquerque (Síndico & Morador)',
    '444.555.666-77',
    'sindico.roberto@condominio.com.br',
    '$2a$10$6C5kaiBO/rd5GE8HQGW/EOJZFAJpfQ8VVR.GOG1he29jOWII2yAk2',
    '11954321098',
    'SINDICO',
    'ATIVO',
    TRUE,
    TRUE,
    clock_timestamp(),
    '1.0',
    '177.12.34.57'
)
ON CONFLICT (cpf) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. VISITANTES
-- ------------------------------------------------------------------------------
INSERT INTO visitantes (
    id,
    nome_completo,
    cpf,
    rg,
    telefone,
    foto_url,
    tipo,
    empresa,
    placa_veiculo,
    ativo
) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'Lucas Mendes de Oliveira',
    '555.666.777-88',
    '12.345.678-9',
    '11943210987',
    'https://storage.neon.tech/photos/visitors/lucas_mendes.jpg',
    'VISITANTE',
    NULL,
    'BRA2E19',
    TRUE
),
(
    'c0000000-0000-0000-0000-000000000002',
    'Eletricista Paulo Santos',
    '666.777.888-99',
    '23.456.789-0',
    '11932109876',
    'https://storage.neon.tech/photos/visitors/paulo_santos.jpg',
    'PRESTADOR_SERVICO',
    'EletroFix Manutenção',
    'ABC1D23',
    TRUE
),
(
    'c0000000-0000-0000-0000-000000000003',
    'Entregador MercadoLivre Bruno',
    '777.888.999-00',
    '34.567.890-1',
    '11921098765',
    NULL,
    'ENTREGADOR',
    'Mercado Livre Express',
    'XYZ9K88',
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. AGENDAMENTOS DE VISITA
-- ------------------------------------------------------------------------------
INSERT INTO agendamentos_visita (
    id,
    unidade_id,
    visitante_id,
    usuario_solicitante_id,
    data_inicio,
    data_fim,
    status,
    qr_code_hash,
    observacoes
) VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000003',
    clock_timestamp() + interval '1 hour',
    clock_timestamp() + interval '5 hours',
    'AUTORIZADO',
    encode(digest('QR-VISITA-2026-LUCAS-APT101', 'sha256'), 'hex'),
    'Visita de familiar para o almoço'
),
(
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000004',
    clock_timestamp() + interval '1 day',
    clock_timestamp() + interval '1 day 4 hours',
    'AGENDADO',
    encode(digest('QR-PRESTADOR-2026-PAULO-PH01', 'sha256'), 'hex'),
    'Manutenção no quadro de distribuição da cobertura'
)
ON CONFLICT (qr_code_hash) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. ENTREGAS & ENCOMENDAS
-- ------------------------------------------------------------------------------
INSERT INTO entregas (
    id,
    unidade_id,
    usuario_destinatario_id,
    porteiro_recebedor_id,
    codigo_barras_qrcode,
    transportadora,
    codigo_rastreio,
    descricao_pacote,
    foto_comprovante_url,
    status,
    data_recebimento,
    notificado_morador,
    notificado_em
) VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000002',
    'PKG-AMZ-20260915-001',
    'Amazon Logística',
    'BR123456789AMZ',
    'Caixa média Amazon (Eletrônicos)',
    'https://storage.neon.tech/packages/pkg_001.jpg',
    'AGUARDANDO_RETIRADA',
    clock_timestamp(),
    TRUE,
    clock_timestamp()
),
(
    'e0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000002',
    'PKG-ML-20260915-002',
    'Mercado Envios',
    'MLB987654321',
    'Envelope de documento urgente',
    'https://storage.neon.tech/packages/pkg_002.jpg',
    'AGUARDANDO_RETIRADA',
    clock_timestamp(),
    TRUE,
    clock_timestamp()
)
ON CONFLICT (id) DO NOTHING;
