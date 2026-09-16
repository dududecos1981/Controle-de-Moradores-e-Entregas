-- ==============================================================================
-- PROJETO: Sistema de Gestão de Portaria, Pessoas e Entregas
-- BANCO DE DADOS: PostgreSQL (Otimizado para Neon Serverless)
-- CONFORMIDADE: LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018)
-- ARQUIVO: schema.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSÕES & CONFIGURAÇÕES
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------------------------
-- 2. TIPOS ENUMERADOS (DOMAIN INTEGRITY)
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE tipo_unidade_enum AS ENUM (
        'APARTAMENTO',
        'CASA',
        'SALA_COMERCIAL',
        'COBERTURA',
        'OUTRO'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE status_unidade_enum AS ENUM (
        'ATIVO',
        'INATIVO',
        'EM_REFORMA'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE perfil_usuario_enum AS ENUM (
        'ADMINISTRADOR',
        'SINDICO',
        'PORTEIRO',
        'MORADOR',
        'PRESTADOR_SERVICO'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE status_usuario_enum AS ENUM (
        'ATIVO',
        'INATIVO',
        'BLOQUEADO',
        'PENDENTE_APROVACAO'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_visitante_enum AS ENUM (
        'VISITANTE',
        'PRESTADOR_SERVICO',
        'ENTREGADOR',
        'CORRETOR',
        'OUTRO'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE status_agendamento_enum AS ENUM (
        'AGENDADO',
        'AUTORIZADO',
        'EM_ANDAMENTO',
        'CONCLUIDO',
        'CANCELADO',
        'EXPIRADO'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE status_entrega_enum AS ENUM (
        'AGUARDANDO_RETIRADA',
        'RETIRADO',
        'DEVOLVIDO',
        'EXTRAVIADO'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_operacao_auditoria_enum AS ENUM (
        'INSERT',
        'UPDATE',
        'DELETE',
        'ANONIMIZACAO_LGPD'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------
-- 3. TABELAS PRINCIPAIS
-- ------------------------------------------------------------------------------

-- Tabela: unidades
CREATE TABLE IF NOT EXISTS unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bloco VARCHAR(20) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    tipo tipo_unidade_enum NOT NULL DEFAULT 'APARTAMENTO',
    status status_unidade_enum NOT NULL DEFAULT 'ATIVO',
    andar INTEGER,
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uk_unidades_bloco_numero UNIQUE (bloco, numero),
    CONSTRAINT chk_unidades_andar CHECK (andar IS NULL OR andar >= -5)
);

COMMENT ON TABLE unidades IS 'Armazena apartamentos, casas, salas comerciais ou lotes do condomínio/edifício.';
COMMENT ON COLUMN unidades.id IS 'Identificador único UUID v4 gerado nativamente pelo PostgreSQL/Neon.';
COMMENT ON COLUMN unidades.bloco IS 'Bloco, torre ou quadra da unidade.';
COMMENT ON COLUMN unidades.numero IS 'Número identificador da unidade (ex: 101, 204B).';

-- Tabela: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
    nome_completo VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    email CITEXT NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    perfil perfil_usuario_enum NOT NULL DEFAULT 'MORADOR',
    status status_usuario_enum NOT NULL DEFAULT 'ATIVO',
    is_responsavel_unidade BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url TEXT,
    
    -- Metadados LGPD (Consentimento e Privacidade)
    lgpd_termo_aceito BOOLEAN NOT NULL DEFAULT FALSE,
    lgpd_data_aceite TIMESTAMPTZ,
    lgpd_versao_termo VARCHAR(20) DEFAULT '1.0',
    lgpd_ip_aceite VARCHAR(45),
    lgpd_anonimizado BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    
    CONSTRAINT uk_usuarios_cpf UNIQUE (cpf),
    CONSTRAINT uk_usuarios_email UNIQUE (email),
    CONSTRAINT chk_usuarios_cpf_format CHECK (
        cpf ~ '^[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}$' OR cpf LIKE 'ANONIMIZADO_%'
    ),
    CONSTRAINT chk_usuarios_telefone CHECK (
        telefone IS NULL OR length(regexp_replace(telefone, '[^0-9]', '', 'g')) BETWEEN 10 AND 13
    )
);

COMMENT ON TABLE usuarios IS 'Usuários do sistema: moradores, porteiros, síndicos e administradores.';
COMMENT ON COLUMN usuarios.cpf IS 'CPF do usuário único. Sujeito à auditoria e mascaramento sob a LGPD.';
COMMENT ON COLUMN usuarios.lgpd_anonimizado IS 'Flag indicando se os dados do titular foram anonimizados a pedido (Art. 18 LGPD).';

-- Tabela: visitantes
CREATE TABLE IF NOT EXISTS visitantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo VARCHAR(150) NOT NULL,
    cpf VARCHAR(14),
    rg VARCHAR(20),
    telefone VARCHAR(20),
    foto_url TEXT,
    tipo tipo_visitante_enum NOT NULL DEFAULT 'VISITANTE',
    empresa VARCHAR(100),
    placa_veiculo VARCHAR(10),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    observacoes TEXT,
    
    -- Metadados LGPD
    lgpd_anonimizado BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    
    CONSTRAINT chk_visitantes_documento CHECK (
        cpf IS NOT NULL OR rg IS NOT NULL OR lgpd_anonimizado = TRUE
    ),
    CONSTRAINT chk_visitantes_cpf_format CHECK (
        cpf IS NULL OR cpf ~ '^[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}$' OR cpf LIKE 'ANONIMIZADO_%'
    )
);

COMMENT ON TABLE visitantes IS 'Cadastro de visitantes, prestadores de serviços, entregadores e terceiros.';
COMMENT ON COLUMN visitantes.foto_url IS 'URL da foto biométrica/facial tirada na portaria ou enviada via pré-cadastro.';

-- Tabela: agendamentos_visita
CREATE TABLE IF NOT EXISTS agendamentos_visita (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE RESTRICT,
    visitante_id UUID NOT NULL REFERENCES visitantes(id) ON DELETE RESTRICT,
    usuario_solicitante_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    usuario_autorizador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    porteiro_entrada_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    porteiro_saida_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    
    data_inicio TIMESTAMPTZ NOT NULL,
    data_fim TIMESTAMPTZ NOT NULL,
    status status_agendamento_enum NOT NULL DEFAULT 'AGENDADO',
    qr_code_hash VARCHAR(64) NOT NULL UNIQUE,
    observacoes TEXT,
    
    entrada_realizada_em TIMESTAMPTZ,
    saida_realizada_em TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    
    CONSTRAINT chk_agendamento_periodo CHECK (data_fim >= data_inicio),
    CONSTRAINT chk_agendamento_execucao CHECK (
        saida_realizada_em IS NULL OR (entrada_realizada_em IS NOT NULL AND saida_realizada_em >= entrada_realizada_em)
    )
);

COMMENT ON TABLE agendamentos_visita IS 'Autorizações de acesso prévio, convites e controle de fluxo na portaria.';
COMMENT ON COLUMN agendamentos_visita.qr_code_hash IS 'Token seguro (SHA-256 ou hash criptográfico) para validação de acesso na portaria/leitor.';

-- Tabela: entregas
CREATE TABLE IF NOT EXISTS entregas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE RESTRICT,
    usuario_destinatario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    porteiro_recebedor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    porteiro_entregador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    
    codigo_barras_qrcode VARCHAR(100) NOT NULL,
    transportadora VARCHAR(100),
    codigo_rastreio VARCHAR(100),
    descricao_pacote VARCHAR(255),
    foto_comprovante_url TEXT,
    foto_retirada_url TEXT,
    
    status status_entrega_enum NOT NULL DEFAULT 'AGUARDANDO_RETIRADA',
    data_recebimento TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    data_retirada TIMESTAMPTZ,
    
    retirado_por_nome VARCHAR(150),
    retirado_por_documento VARCHAR(30),
    
    notificado_morador BOOLEAN NOT NULL DEFAULT FALSE,
    notificado_em TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    
    CONSTRAINT chk_entregas_retirada CHECK (
        (status = 'RETIRADO' AND data_retirada IS NOT NULL) OR
        (status <> 'RETIRADO' AND data_retirada IS NULL)
    )
);

COMMENT ON TABLE entregas IS 'Controle de encomendas, pacotes e correspondências recebidas na portaria.';
COMMENT ON COLUMN entregas.codigo_barras_qrcode IS 'Código de barras de rastreamento do pacote ou QR Code gerado pelo sistema.';

-- ------------------------------------------------------------------------------
-- 4. TABELA DE AUDITORIA & LGPD
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logs_auditoria_lgpd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabela VARCHAR(50) NOT NULL,
    operacao tipo_operacao_auditoria_enum NOT NULL,
    registro_id UUID NOT NULL,
    usuario_responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    usuario_contexto VARCHAR(100),
    ip_origem VARCHAR(45),
    dados_anteriores JSONB,
    dados_novos JSONB,
    campos_alterados TEXT[],
    motivo_operacao TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

COMMENT ON TABLE logs_auditoria_lgpd IS 'Trilha de auditoria imutável para conformidade com a LGPD (registro de operações com dados pessoais).';

-- ------------------------------------------------------------------------------
-- 5. ÍNDICES DE PERFORMANCE (OTIMIZADOS PARA SERVERLESS POSTGRES / NEON)
-- ------------------------------------------------------------------------------

-- Índices: unidades
CREATE INDEX IF NOT EXISTS idx_unidades_bloco_numero ON unidades (bloco, numero);
CREATE INDEX IF NOT EXISTS idx_unidades_status ON unidades (status);

-- Índices: usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios (cpf);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);
CREATE INDEX IF NOT EXISTS idx_usuarios_unidade_id ON usuarios (unidade_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil ON usuarios (perfil);
CREATE INDEX IF NOT EXISTS idx_usuarios_status_ativo ON usuarios (status) WHERE status = 'ATIVO';
CREATE INDEX IF NOT EXISTS idx_usuarios_nome_trgm ON usuarios USING gin (nome_completo gin_trgm_ops);

-- Índices: visitantes
CREATE INDEX IF NOT EXISTS idx_visitantes_cpf ON visitantes (cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_visitantes_rg ON visitantes (rg) WHERE rg IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_visitantes_placa ON visitantes (placa_veiculo) WHERE placa_veiculo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_visitantes_nome_trgm ON visitantes USING gin (nome_completo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_visitantes_ativos ON visitantes (ativo) WHERE ativo = TRUE;

-- Índices: agendamentos_visita
CREATE INDEX IF NOT EXISTS idx_agendamentos_qr_code_hash ON agendamentos_visita (qr_code_hash);
CREATE INDEX IF NOT EXISTS idx_agendamentos_unidade_periodo ON agendamentos_visita (unidade_id, data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_agendamentos_visitante ON agendamentos_visita (visitante_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_solicitante ON agendamentos_visita (usuario_solicitante_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status_pendente ON agendamentos_visita (status, data_inicio) 
    WHERE status IN ('AGENDADO', 'AUTORIZADO', 'EM_ANDAMENTO');

-- Índices: entregas
CREATE INDEX IF NOT EXISTS idx_entregas_codigo_barras_qrcode ON entregas (codigo_barras_qrcode);
CREATE INDEX IF NOT EXISTS idx_entregas_unidade_id ON entregas (unidade_id);
CREATE INDEX IF NOT EXISTS idx_entregas_destinatario_id ON entregas (usuario_destinatario_id);
CREATE INDEX IF NOT EXISTS idx_entregas_status_aguardando ON entregas (unidade_id, status, data_recebimento DESC) 
    WHERE status = 'AGUARDANDO_RETIRADA';
CREATE INDEX IF NOT EXISTS idx_entregas_codigo_rastreio ON entregas (codigo_rastreio) 
    WHERE codigo_rastreio IS NOT NULL;

-- Índices: logs_auditoria_lgpd
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_tabela_registro ON logs_auditoria_lgpd (tabela, registro_id);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_created_at_desc ON logs_auditoria_lgpd (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_operacao ON logs_auditoria_lgpd (operacao);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_usuario_resp ON logs_auditoria_lgpd (usuario_responsavel_id) 
    WHERE usuario_responsavel_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_dados_novos_gin ON logs_auditoria_lgpd USING gin (dados_novos);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_dados_anteriores_gin ON logs_auditoria_lgpd USING gin (dados_anteriores);

-- ------------------------------------------------------------------------------
-- 6. FUNÇÕES E TRIGGERS (UPDATED_AT & LGPD AUDIT)
-- ------------------------------------------------------------------------------

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION fn_set_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de updated_at para todas as tabelas editáveis
DROP TRIGGER IF EXISTS trg_unidades_updated_at ON unidades;
CREATE TRIGGER trg_unidades_updated_at
    BEFORE UPDATE ON unidades
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_visitantes_updated_at ON visitantes;
CREATE TRIGGER trg_visitantes_updated_at
    BEFORE UPDATE ON visitantes
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_agendamentos_visita_updated_at ON agendamentos_visita;
CREATE TRIGGER trg_agendamentos_visita_updated_at
    BEFORE UPDATE ON agendamentos_visita
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_entregas_updated_at ON entregas;
CREATE TRIGGER trg_entregas_updated_at
    BEFORE UPDATE ON entregas
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_timestamp_updated_at();

-- ------------------------------------------------------------------------------
-- 7. FUNÇÃO E TRIGGER DE AUDITORIA LGPD UNIVERSAL
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_audit_lgpd_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
    v_changed_fields TEXT[] := ARRAY[]::TEXT[];
    v_key TEXT;
    v_user_resp_id UUID := NULL;
    v_user_context VARCHAR(100) := NULL;
    v_ip_origem VARCHAR(45) := NULL;
    v_motivo TEXT := NULL;
    v_target_id UUID;
BEGIN
    -- Captura variáveis de sessão se definidas pela camada de aplicação/Neon
    BEGIN
        v_user_resp_id := NULLIF(current_setting('app.current_user_id', true), '')::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_user_resp_id := NULL;
    END;

    v_user_context := NULLIF(current_setting('app.current_user_name', true), '');
    v_ip_origem    := NULLIF(current_setting('app.client_ip', true), '');
    v_motivo       := NULLIF(current_setting('app.audit_reason', true), '');

    IF TG_OP = 'INSERT' THEN
        v_target_id := NEW.id;
        v_new_data := to_jsonb(NEW);
        
        -- Mascarar campos ultrassensíveis (como senha_hash)
        IF v_new_data ? 'senha_hash' THEN
            v_new_data := v_new_data || '{"senha_hash": "[PROTEGIDO]"}'::jsonb;
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        v_target_id := NEW.id;
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);

        -- Mascarar campos ultrassensíveis
        IF v_old_data ? 'senha_hash' THEN
            v_old_data := v_old_data || '{"senha_hash": "[PROTEGIDO]"}'::jsonb;
        END IF;
        IF v_new_data ? 'senha_hash' THEN
            v_new_data := v_new_data || '{"senha_hash": "[PROTEGIDO]"}'::jsonb;
        END IF;

        -- Identifica quais colunas foram alteradas
        FOR v_key IN SELECT jsonb_object_keys(v_new_data)
        LOOP
            IF (v_old_data -> v_key) IS DISTINCT FROM (v_new_data -> v_key) THEN
                v_changed_fields := array_append(v_changed_fields, v_key);
            END IF;
        END LOOP;

        -- Se nenhuma coluna relevante mudou (além de updated_at), ignora auditoria redundante
        IF array_length(v_changed_fields, 1) = 1 AND v_changed_fields[1] = 'updated_at' THEN
            RETURN NEW;
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        v_target_id := OLD.id;
        v_old_data := to_jsonb(OLD);

        IF v_old_data ? 'senha_hash' THEN
            v_old_data := v_old_data || '{"senha_hash": "[PROTEGIDO]"}'::jsonb;
        END IF;
    END IF;

    -- Inserção na tabela de logs auditáveis imutáveis
    INSERT INTO logs_auditoria_lgpd (
        tabela,
        operacao,
        registro_id,
        usuario_responsavel_id,
        usuario_contexto,
        ip_origem,
        dados_anteriores,
        dados_novos,
        campos_alterados,
        motivo_operacao,
        created_at
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP::tipo_operacao_auditoria_enum,
        v_target_id,
        v_user_resp_id,
        v_user_context,
        v_ip_origem,
        v_old_data,
        v_new_data,
        v_changed_fields,
        v_motivo,
        clock_timestamp()
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers de Auditoria LGPD
DROP TRIGGER IF EXISTS trg_audit_usuarios_lgpd ON usuarios;
CREATE TRIGGER trg_audit_usuarios_lgpd
    AFTER INSERT OR UPDATE OR DELETE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION fn_audit_lgpd_trigger();

DROP TRIGGER IF EXISTS trg_audit_visitantes_lgpd ON visitantes;
CREATE TRIGGER trg_audit_visitantes_lgpd
    AFTER INSERT OR UPDATE OR DELETE ON visitantes
    FOR EACH ROW
    EXECUTE FUNCTION fn_audit_lgpd_trigger();

DROP TRIGGER IF EXISTS trg_audit_agendamentos_lgpd ON agendamentos_visita;
CREATE TRIGGER trg_audit_agendamentos_lgpd
    AFTER INSERT OR UPDATE OR DELETE ON agendamentos_visita
    FOR EACH ROW
    EXECUTE FUNCTION fn_audit_lgpd_trigger();

DROP TRIGGER IF EXISTS trg_audit_entregas_lgpd ON entregas;
CREATE TRIGGER trg_audit_entregas_lgpd
    AFTER INSERT OR UPDATE OR DELETE ON entregas
    FOR EACH ROW
    EXECUTE FUNCTION fn_audit_lgpd_trigger();

-- ------------------------------------------------------------------------------
-- 8. PROCEDURE / FUNÇÃO DE CONFORMIDADE LGPD: DIREITO AO ESQUECIMENTO / ANONIMIZAÇÃO
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_anonimizar_usuario_lgpd(
    p_usuario_id UUID,
    p_motivo TEXT DEFAULT 'Solicitação expressa do titular conforme Art. 18 da LGPD'
)
RETURNS VOID AS $$
DECLARE
    v_random_hash VARCHAR(16);
    v_usuario_nome VARCHAR(150);
BEGIN
    SELECT nome_completo INTO v_usuario_nome FROM usuarios WHERE id = p_usuario_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuário com ID % não encontrado.', p_usuario_id;
    END IF;

    v_random_hash := substr(md5(gen_random_uuid()::text), 1, 8);

    -- Atualizar registro anonimizando PII (Personally Identifiable Information)
    UPDATE usuarios
    SET
        nome_completo = 'TITULAR_ANONIMIZADO_' || v_random_hash,
        cpf = 'ANONIMIZADO_' || v_random_hash,
        email = ('anonimizado_' || v_random_hash || '@lgpd.local')::citext,
        telefone = NULL,
        senha_hash = '[DADOS_ANONIMIZADOS]',
        avatar_url = NULL,
        status = 'INATIVO',
        lgpd_anonimizado = TRUE,
        updated_at = clock_timestamp()
    WHERE id = p_usuario_id;

    -- Registra evento explícito de anonimização no log de auditoria
    INSERT INTO logs_auditoria_lgpd (
        tabela,
        operacao,
        registro_id,
        motivo_operacao,
        campos_alterados,
        dados_novos,
        created_at
    ) VALUES (
        'usuarios',
        'ANONIMIZACAO_LGPD',
        p_usuario_id,
        p_motivo,
        ARRAY['nome_completo', 'cpf', 'email', 'telefone', 'senha_hash', 'avatar_url', 'lgpd_anonimizado'],
        jsonb_build_object(
            'nome_anterior_mascarado', substr(v_usuario_nome, 1, 3) || '***',
            'data_anonimizacao', clock_timestamp(),
            'fundamento_legal', 'Artigo 18, Inciso VI da LGPD'
        ),
        clock_timestamp()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_anonimizar_usuario_lgpd IS 'Anonimiza dados pessoais de um usuário preservando a integridade referencial histórica de entregas e visitas.';
