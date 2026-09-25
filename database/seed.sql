-- ==============================================================================
-- PROJETO: Sistema de Gestão de Portaria, Pessoas e Entregas
-- BANCO DE DADOS: PostgreSQL (Neon Serverless)
-- ARQUIVO: seed.sql (Dados Base Iniciais Limpos para Testes e Produção)
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
ON CONFLICT (bloco, numero) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. USUÁRIOS (Inserção manual pelo administrador/usuários)
-- ------------------------------------------------------------------------------
-- Base de usuários inicial limpa para cadastro manual dos administradores,
-- porteiros, síndicos e moradores.

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
ON CONFLICT (id) DO NOTHING;
