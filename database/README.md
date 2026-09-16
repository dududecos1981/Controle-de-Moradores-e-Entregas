# Banco de Dados - Gestão de Portaria, Pessoas e Entregas

Camada de persistência relacional modelada para **PostgreSQL** com otimizações para **Neon Serverless PostgreSQL** e em total conformidade com a **LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018)**.

---

## 📁 Estrutura de Arquivos

- [schema.sql](file:///c:/Users/Windows/Documents/Cadastro%20de%20Pessoas%20e%20Entregas/database/schema.sql): DDL completo do banco, incluindo tipos `ENUM`, tabelas, constraints de integridade, índices otimizados para busca textual (`trgm`), chaves estrangeiras, triggers de `updated_at` e função universal de trilha de auditoria LGPD.
- [seed.sql](file:///c:/Users/Windows/Documents/Cadastro%20de%20Pessoas%20e%20Entregas/database/seed.sql): Dados iniciais para homologação e testes (unidades, usuários, visitantes, agendamentos e entregas).

---

## 🏛️ Principais Entidades e Tabelas

1. **`unidades`**: Apartamentos, salas, casas ou coberturas com identificação de bloco/número.
2. **`usuarios`**: Moradores, porteiros, síndicos e administradores com controle de status, perfil RBAC e hash bcrypt.
3. **`visitantes`**: Visitantes, prestadores de serviço e entregadores com suporte a biometria facial, RG/CPF e placa veicular.
4. **`agendamentos_visita`**: Pré-autorizações de visita emitidas por moradores com controle de período e QR Code hash.
5. **`entregas`**: Encomendas recebidas na portaria com código de barras, fotos do pacote/retirada e rastreamento de status.
6. **`logs_auditoria_lgpd`**: Trilha imutável de auditoria registrando `INSERT`, `UPDATE`, `DELETE` e `ANONIMIZACAO_LGPD` com mascaramento automático de campos ultrassensíveis (como hashes de senhas).

---

## 🚀 Como Executar no Neon Serverless PostgreSQL

### Opção 1: Pelo Console Web do Neon
1. Acesse o dashboard do seu projeto no [Neon Console](https://console.neon.tech).
2. Abra a aba **SQL Editor**.
3. Copie o conteúdo de [schema.sql](file:///c:/Users/Windows/Documents/Cadastro%20de%20Pessoas%20e%20Entregas/database/schema.sql) e clique em **Run**.
4. *(Opcional)* Copie o conteúdo de [seed.sql](file:///c:/Users/Windows/Documents/Cadastro%20de%20Pessoas%20e%20Entregas/database/seed.sql) e clique em **Run** para popular dados de teste.

### Opção 2: Via Terminal / `psql`
```bash
psql "postgresql://[user]:[password]@[host]/[dbname]?sslmode=require" -f database/schema.sql
psql "postgresql://[user]:[password]@[host]/[dbname]?sslmode=require" -f database/seed.sql
```

---

## 🔒 Conformidade LGPD
- Anonimização de titulares (Art. 18 da LGPD) suportada via rotas de API e triggers.
- Mascaramento e proteção de dados sensíveis na tabela de logs auditáveis.
- Índices parciais e trigram indexes (`gin_trgm_ops`) para busca rápida e segura.
