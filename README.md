# Sistema de Gestão de Portaria, Pessoas e Entregas (Full-Stack)

Solução corporativa completa para controle de acesso, gestão de portaria e rastreamento de encomendas em condomínios residenciais e edifícios comerciais.

---

## 🏛️ Estrutura do Ecossistema

```
Cadastro de Pessoas e Entregas/
├── database/                   # Passo 1: Modelagem Neon Serverless PostgreSQL & LGPD
│   ├── schema.sql              # DDL completo, tipos ENUM, índices de busca, triggers de auditoria LGPD
│   ├── seed.sql                # Dados iniciais para homologação
│   └── README.md               # Documentação técnica do banco
│
├── backend/                    # Passo 2: API RESTful (NestJS + TypeScript)
│   ├── src/
│   │   ├── config/             # Configurações de ambiente e Neon DB
│   │   ├── database/           # Pool PostgreSQL / SSL / Sessão LGPD
│   │   ├── common/             # Guards JWT/RBAC, decorators, filtros e interceptors
│   │   └── modules/
│   │       ├── auth/           # Login, Registro, Refresh Token e Me
│   │       ├── unidades/       # CRUD de Unidades / Blocos / Apartamentos
│   │       ├── usuarios/       # CRUD de Usuários e Anonimização (LGPD Art. 18)
│   │       ├── visitantes/     # CRUD de Visitantes e Histórico
│   │       └── upload/         # Upload seguro com Sharp (WebP) e S3/Local
│   └── README.md               # Documentação da API e Swagger Docs
│
├── frontend/                   # Passo 3: Aplicação Portaria Pro (Next.js + Tailwind CSS)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Dashboard com status de encomendas e métricas
│   │   │   ├── visitantes/     # Cadastro rápido com captura por Webcam
│   │   │   └── encomendas/     # Registro com leitor óptico USB e câmera
│   │   ├── components/         # WebcamCapture, BarcodeScanner, PackageWithdrawalModal
│   │   └── lib/                # Web Audio API (bips/shutter) e Mock Store
│   └── README.md               # Guia de execução do frontend
│
└── mobile/                     # Passo 4: App Morador Pro (Next.js PWA / Mobile-First)
    ├── src/
    │   ├── app/
    │   │   └── page.tsx        # Feed de encomendas, QR code e pré-autorização de convites
    │   ├── components/         # BottomNav, SignatureCanvas, QRCodeDisplay
    │   └── screens/            # FeedEncomendasScreen, CriarConviteScreen, PerfilMoradorScreen
    └── README.md               # Guia do app do morador
```

---

## 🚀 Como Iniciar o Projeto Completo

### 1. Banco de Dados (Neon PostgreSQL)
Execute o script [database/schema.sql](file:///c:/Users/Windows/Documents/Cadastro%20de%20Pessoas%20e%20Entregas/database/schema.sql) no painel do Neon ou via CLI.

### 2. Backend (NestJS API)
```bash
cd backend
npm install
npm run start:dev
```
- API Base: `http://localhost:3000/api`
- Swagger / OpenAPI: `http://localhost:3000/api/docs`

### 3. Frontend (Portaria Pro - Next.js)
```bash
cd frontend
npm install
npm run dev
```
- Acesso à Portaria: `http://localhost:3000`

### 4. Mobile (Morador Pro - Next.js)
```bash
cd mobile
npm install
npm run dev
```
- Acesso do Morador: `http://localhost:3001`
