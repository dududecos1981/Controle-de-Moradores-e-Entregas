# Backend API - Sistema de Gestão de Portaria, Pessoas e Entregas

> **Framework:** NestJS (Node.js 20+ / TypeScript)  
> **Database:** Neon Serverless PostgreSQL  
> **Segurança:** JWT (Access + Refresh Token), RBAC (Perfis de Acesso), Sharp (Sanitização EXIF & Compressão WebP), LGPD Compliant

---

## 🚀 Como Executar o Backend

### 1. Instalação das Dependências
```bash
cd backend
npm install
```

### 2. Configuração do `.env`
Edite o arquivo `.env` inserindo a string de conexão do Neon PostgreSQL:
```env
PORT=3000
API_PREFIX=api
DATABASE_URL=postgresql://[user]:[password]@[neon-hostname]/[database]?sslmode=require
DATABASE_SSL=true

JWT_SECRET=super-secret-jwt-key-2026
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=super-secret-refresh-key-2026
JWT_REFRESH_EXPIRES_IN=7d

STORAGE_DRIVER=local
UPLOAD_DESTINATION=./uploads
BASE_APP_URL=http://localhost:3000
```

### 3. Execução em Modo de Desenvolvimento
```bash
npm run start:dev
```

Acesse no navegador:
- **API Base:** `http://localhost:3000/api`
- **Swagger / OpenAPI Interativo:** `http://localhost:3000/api/docs`

---

## 🔐 1. Autenticação & RBAC (Controle de Acesso)

| Perfil | Descrição |
| :--- | :--- |
| `ADMINISTRADOR` | Acesso total ao sistema, exclusão de dados e auditoria. |
| `SINDICO` | Gestão de condomínio, unidades, aprovações e relatórios. |
| `PORTEIRO` | Operação da portaria, liberação de visitantes, recebimento de encomendas. |
| `MORADOR` | Visualização de sua unidade, solicitação de convites e consulta de encomendas. |

### Fluxo JWT:
1. `POST /api/auth/login` -> Retorna `accessToken` (15m) e `refreshToken` (7d).
2. As rotas protegidas exigem o cabeçalho: `Authorization: Bearer <accessToken>`.
3. `POST /api/auth/refresh` -> Renova o par de tokens sem exigir novo login do usuário.

---

## 📋 2. Resumo dos Endpoints REST

### Autenticação (`/api/auth`)
- `POST /api/auth/login`: Login de morador/porteiro/admin
- `POST /api/auth/register`: Registro de novos usuários
- `POST /api/auth/refresh`: Renovação do access token
- `GET /api/auth/me`: Perfil do usuário autenticado

### Unidades (`/api/unidades`)
- `GET /api/unidades`: Listagem com filtros por bloco, número e status
- `GET /api/unidades/:id`: Detalhes da unidade e moradores vinculados
- `POST /api/unidades`: Criação de nova unidade (Apenas ADMIN/SÍNDICO)
- `PUT /api/unidades/:id`: Atualização cadastral da unidade
- `DELETE /api/unidades/:id`: Exclusão de unidade

### Usuários (`/api/usuarios`)
- `GET /api/usuarios`: Busca com Trigram e filtros por perfil/unidade
- `GET /api/usuarios/:id`: Detalhes do morador/colaborador
- `POST /api/usuarios`: Cadastro de usuário
- `PUT /api/usuarios/:id`: Atualização cadastral
- `POST /api/usuarios/:id/anonimizar-lgpd`: Execução de Direito ao Esquecimento (LGPD Art. 18)
- `DELETE /api/usuarios/:id`: Remoção de usuário

### Visitantes (`/api/visitantes`)
- `GET /api/visitantes`: Listagem com busca textual, placa e empresa
- `GET /api/visitantes/:id`: Detalhes com histórico de visitas
- `POST /api/visitantes`: Cadastro de visitante ou prestador
- `PUT /api/visitantes/:id`: Atualização de dados
- `DELETE /api/visitantes/:id`: Exclusão de visitante

### Uploads & Imagens (`/api/uploads`)
- `POST /api/uploads/imagem?pasta=visitantes`: Upload de foto com compressão automática via **Sharp** em formato WebP, remoção de metadados EXIF/GPS e salvamento local ou no AWS S3.
