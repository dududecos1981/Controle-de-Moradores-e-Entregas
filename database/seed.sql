-- ==============================================================================
-- PROJETO: Sistema de Gestão de Portaria, Pessoas e Entregas
-- BANCO DE DADOS: PostgreSQL (Neon Serverless)
-- ARQUIVO: seed.sql (Dados Base Iniciais para Produção e Testes)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. UNIDADES BASE DO CONDOMÍNIO
-- ------------------------------------------------------------------------------
INSERT INTO unidades (id, bloco, numero, tipo, status, andar, observacoes) VALUES
('a0000000-0000-0000-0000-000000000001', 'A', '101', 'APARTAMENTO', 'ATIVO', 1, 'Apartamento térreo frente'),
('a0000000-0000-0000-0000-000000000002', 'A', '102', 'APARTAMENTO', 'ATIVO', 1, 'Apartamento térreo fundos'),
('a0000000-0000-0000-0000-000000000003', 'A', '201', 'APARTAMENTO', 'ATIVO', 2, 'Apartamento 2º andar'),
('a0000000-0000-0000-0000-000000000004', 'B', '101', 'APARTAMENTO', 'ATIVO', 1, 'Torre B'),
('a0000000-0000-0000-0000-000000000005', 'B', 'PH01', 'COBERTURA', 'ATIVO', 12, 'Cobertura duplex')
ON CONFLICT (bloco, numero) DO UPDATE SET status = 'ATIVO';

-- ------------------------------------------------------------------------------
-- 2. USUÁRIOS PADRÃO DO SISTEMA
-- ------------------------------------------------------------------------------
INSERT INTO usuarios (
    id,
    nome_completo,
    cpf,
    email,
    senha_hash,
    telefone,
    perfil,
    status,
    is_responsavel_unidade,
    unidade_id,
    lgpd_termo_aceito,
    lgpd_data_aceite
) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'Administrador Geral',
    '000.000.000-01',
    'admin@portaria.com',
    '$2a$10$SmMJl/ueV3cWFOu1h9G1RuLCkGo3Ol/wMiiGsvQfltgAiwe8iUG1y', -- Admin@123456
    '11999990001',
    'ADMINISTRADOR',
    'ATIVO',
    FALSE,
    NULL,
    TRUE,
    clock_timestamp()
),
(
    'b0000000-0000-0000-0000-000000000002',
    'Porteiro de Plantão',
    '000.000.000-03',
    'porteiro@portaria.com',
    '$2a$10$eYxH6VYJATi3DKzPyqqXkO485tpgm1ipMqjMYQqetjplG53mnse6O', -- Porteiro@123456
    '11999990002',
    'PORTEIRO',
    'ATIVO',
    FALSE,
    NULL,
    TRUE,
    clock_timestamp()
),
(
    'b0000000-0000-0000-0000-000000000003',
    'Síndico Condominial',
    '000.000.000-02',
    'sindico@portaria.com',
    '$2a$10$jqkbYF2RueJF1MkIhZuQh.OjNEnWrKc9Sh52App.Sf2U/ObbIa1wC', -- Sindico@123456
    '11999990003',
    'SINDICO',
    'ATIVO',
    FALSE,
    NULL,
    TRUE,
    clock_timestamp()
)
ON CONFLICT (cpf) DO UPDATE SET
    nome_completo = EXCLUDED.nome_completo,
    email = EXCLUDED.email,
    senha_hash = EXCLUDED.senha_hash,
    perfil = EXCLUDED.perfil,
    status = EXCLUDED.status,
    unidade_id = EXCLUDED.unidade_id;

-- ------------------------------------------------------------------------------
-- 3. ÁREAS COMUNS (LAZER & EVENTOS)
-- ------------------------------------------------------------------------------
INSERT INTO areas_comuns (
    id,
    nome,
    descricao,
    capacidade_maxima,
    taxa_reserva,
    foto_url,
    regras,
    status
) VALUES
(
    '70000000-0000-0000-0000-000000000001',
    'Espaço Gourmet & Churrasqueira',
    'Espaço climatizado com churrasqueira a carvão, freezer horizontal, cooktop por indução e mesas para até 35 pessoas.',
    35,
    120.00,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    'Horário de uso das 10h às 22h. Música em volume ambiente. Limpeza inclusa na taxa.',
    'DISPONIVEL'
),
(
    '70000000-0000-0000-0000-000000000002',
    'Salão Nobre de Festas',
    'Salão amplo com sistema de som integrado, iluminação cênica, cozinha industrial completa e sanitários privativos.',
    80,
    250.00,
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    'Horário de uso das 12h às 00h. Proibido fumar no ambiente interno. Entrega de lista de convidados na portaria com 24h de antecedência.',
    'DISPONIVEL'
),
(
    '70000000-0000-0000-0000-000000000003',
    'Quadra Poliesportiva & Beach Tennis',
    'Quadra iluminada com piso modular e quadra de areia para Beach Tennis e Vôlei.',
    20,
    0.00,
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    'Uso máximo de 2 horas consecutivas por unidade. Uso obrigatório de calçado apropriado.',
    'DISPONIVEL'
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    capacidade_maxima = EXCLUDED.capacidade_maxima,
    taxa_reserva = EXCLUDED.taxa_reserva,
    status = EXCLUDED.status;
