# Sistema de Gestão de Portaria, Pessoas e Entregas (SUPE)

> **Solução corporativa, segura, moderna e 100% gratuita** para controle de acesso, recepção de encomendas com leitor óptico/QR Code, gestão de moradores/residentes com foto biométrica, conformidade rigorosa com a LGPD e inteligência artificial para comunicados prediais.

---

## 🏛️ Arquitetura do Sistema

O ecossistema é dividido em três camadas desacopladas e integradas em tempo real:

```
Cadastro de Pessoas e Entregas/
├── database/                   # 1. Neon Serverless PostgreSQL + RLS + LGPD
│   ├── schema.sql              # DDL completo, ENUMs, Triggers de Auditoria LGPD & Políticas RLS
│   ├── seed.sql                # Dados iniciais para homologação e testes
│   └── README.md               # Documentação da modelagem relacional e segurança
│
├── backend/                    # 2. API RESTful Corporativa (NestJS + TypeScript)
│   ├── src/
│   │   ├── config/             # Configurações de ambiente, CORS seguro e JWT
│   │   ├── database/           # Pool PostgreSQL / SSL / Sessão auditável LGPD
│   │   ├── common/             # Guards JWT/RBAC, decorators e interceptors
│   │   └── modules/
│   │       ├── auth/           # Login, Registro, Refresh Token e Me
│   │       ├── unidades/       # Gestão de Blocos, Torres e Apartamentos
│   │       ├── usuarios/       # Gestão de Moradores, Porteiros e Anonimização LGPD
│   │       ├── visitantes/     # Visitantes, Prestadores de Serviço e Histórico
│   │       ├── entregas/       # Registro, Notificações e Baixa de Encomendas
│   │       ├── agendamentos/   # Pré-autorizações com QR Code
│   │       └── upload/         # Upload seguro com compressão Sharp (WebP)
│   └── README.md               # Documentação da API e Swagger Docs
│
├── frontend/                   # 3. Painel da Portaria Pro (Next.js + Tailwind CSS)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Dashboard em tempo real com métricas e feed
│   │   │   ├── encomendas/         # Registro de pacotes com leitor óptico USB/Câmera
│   │   │   ├── visitantes/         # Cadastro ágil de visitantes com foto via Webcam
│   │   │   ├── moradores/          # Ficha completa de residentes, veículos e LGPD
│   │   │   ├── comunicados-ia/     # Assistente IA com Google Gemini para avisos e WhatsApp
│   │   │   └── api/ia/             # Endpoint server-side seguro para chamadas de IA
│   │   ├── components/             # WebcamCapture, BarcodeScanner, PackageWithdrawalModal
│   │   └── lib/                    # Web Audio API (bips/shutter), Store e Client API
│   └── README.md                   # Guia de execução da portaria
│
└── mobile/                     # 4. App do Morador Pro (Next.js PWA / Mobile-First)
    ├── src/
    │   ├── app/
    │   │   └── page.tsx            # Feed de encomendas, QR Code de retirada e convites
    │   ├── components/             # BottomNav, SignatureCanvas, QRCodeDisplay
    │   └── screens/                # FeedEncomendasScreen, CriarConviteScreen, PerfilMoradorScreen
    └── README.md                   # Guia do aplicativo do morador
```

---

## 🔒 Segurança, Neon Serverless & Conformidade LGPD

- **PostgreSQL no Neon (Serverless):** Conexão criptografada via SSL nativo, alta performance e pooling integrado.
- **Row Level Security (RLS):** Isolamento total dos dados — condôminos acessam exclusivamente as informações de sua própria unidade, enquanto porteiros e administradores operam com privilégios de gestão.
- **LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018):**
  - Termo de consentimento explícito e auditável para biometria facial e documentos.
  - Direito ao Esquecimento / Anonimização de dados pessoais (Art. 18 da LGPD) com preservação da integridade histórica.
  - Trilha de auditoria imutável (`logs_auditoria_lgpd`) com triggers automáticos.
- **Inteligência Artificial Segura (Prompt 6):** As chaves de API (`GOOGLE_API_KEY`) nunca são expostas no frontend; todo processamento ocorre via serverless routes no backend.

---

## 🚀 Como Executar o Projeto Localmente

### 1. Banco de Dados (Neon PostgreSQL)
1. Crie um banco de dados gratuito no [Neon Console](https://console.neon.tech).
2. Execute os scripts `database/schema.sql` e opcionalmente `database/seed.sql` na aba **SQL Editor**.

### 2. Backend (NestJS API)
```bash
cd backend
npm install
npm run start:dev
```
- **API Base:** `http://localhost:3000/api`
- **Swagger / OpenAPI Interativo:** `http://localhost:3000/api/docs`

### 3. Painel da Portaria (Frontend - Next.js)
```bash
cd frontend
npm install
npm run dev
```
- **Acesso da Portaria:** `http://localhost:3000`

### 4. Aplicativo do Morador (Mobile - Next.js)
```bash
cd mobile
npm install
npm run dev
```
- **Acesso do Morador:** `http://localhost:3001`

---

## 🌐 Guia de Deploy 100% Gratuito em Produção (Prompt 7)

### Hospedagem do Frontend e Mobile na Vercel (Gratuito)
1. Envie o projeto para o seu repositório no **GitHub**.
2. No painel da [Vercel](https://vercel.com):
   - **Frontend (Portaria):** Conecte o repositório. O arquivo raiz `vercel.json` já roteia para a pasta `frontend`.
   - **Mobile (Morador):** Crie um novo projeto importando o mesmo repositório e selecione a pasta `mobile` como **Root Directory**.
3. Adicione as variáveis de ambiente necessárias (`GOOGLE_API_KEY`, `NEXT_PUBLIC_API_URL`).
4. Clique em **Deploy**.

### Hospedagem do Backend no Render / Railway (Gratuito)
1. Crie um Web Service no [Render](https://render.com) ou [Railway](https://railway.app).
2. Aponte para a pasta `backend` com comando de build `npm install && npm run build` e start `npm run start:prod`.
3. Configure a variável de ambiente `DATABASE_URL` com a string de conexão do Neon DB.
