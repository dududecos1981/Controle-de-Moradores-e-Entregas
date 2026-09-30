# 🏢 Sistema Integrado de Portaria, Encomendas & App do Morador
## Documento Executivo de Apresentação e Especificação Técnica

---

## 📌 Sumário Executivo

O **Sistema Integrado de Portaria e Controle de Moradores** é uma plataforma full-stack moderna, projetada para modernizar e digitalizar toda a rotina de condomínios residenciais e comerciais. O sistema substitui livros de registros físicos e planilhas por uma solução em tempo real, conectando porteiros, administradores, síndicos e moradores através da web e celulares.

---

## 🎯 Principais Problemas Resolvidos

| Cenário Tradicional (Sem o Sistema) | Com o Sistema de Portaria Inteligente |
| :--- | :--- |
| **Livro físico de encomendas:** extravios, caligrafia ilegível e falta de aviso imediato ao morador. | **Bipagem instantânea com câmera**, upload de foto do pacote e aviso automático no WhatsApp/App. |
| **Filas na portaria:** visitantes aguardando liberação manual e ligações por interfone. | **Convites pré-autorizados via QR Code** enviados diretamente pelo morador ao convidado. |
| **Falta de comprovação de entrega:** dúvidas sobre quem retirou o pacote. | **QR Code único de retirada + Assinatura Digital** em tela com registro de data, hora e porteiro. |
| **Insegurança e falta de auditoria de dados.** | **Conformidade nativa com a LGPD** (Lei nº 13.709/2018), logs de auditoria e isolamento por unidade. |
| **Comunicados e avisos demorados.** | **Gerador de comunicados assistido por Inteligência Artificial** para o síndico. |

---

## 🛠️ Stack Tecnológica Completa (Tudo o que Usamos)

### 1. Frontend Web (Painel da Portaria & Gestão)
- **Framework Principal:** Next.js 14 (App Router, Server Components e Client Components).
- **Linguagem:** TypeScript (Tipagem estática rigorosa para segurança e robustez).
- **Biblioteca de Interface:** React 18.
- **Estilização e Design System:** Tailwind CSS com paleta escura ultra-moderna (*Dark Glassmorphism*), gradientes e micro-animações.
- **Ícones:** Lucide React (mais de 50 ícones temáticos).
- **Leitura de Códigos:** `html5-qrcode` (Scanner em tempo real de código de barras e QR Codes via câmera do dispositivo).
- **Áudio & Feedback:** Sistema nativo de efeitos sonoros web (`Web Audio API / SoundEffects`) para confirmações de bipe e sucesso.

---

### 2. Mobile App (Aplicativo do Morador)
- **Tecnologia:** Next.js Mobile WebApp (PWA Ready / Touch-First).
- **Modo Amplo Inovador:** Visualização ampla com inputs táteis de `52px+`, botões de polegar único e tipografia anti-zoom para iOS e Android.
- **Canvas de Assinatura:** Canvas HTML5 de alta resolução (High-DPI) para coleta de assinaturas na tela do celular ou tablet.
- **Integração WhatsApp:** Disparo de links formatados com tokens de acesso e dados do condomínio.
- **Persistência Híbrida:** Sincronização em nuvem com fallback em `localStorage` para operação offline.

---

### 3. Backend & API
- **Framework:** NestJS 10 (Arquitetura modular corporativa com injeção de dependências).
- **Runtime:** Node.js (v20 LTS).
- **Comunicação em Tempo Real:** Socket.io (WebSockets para notificações instantâneas sem recarregar a página).
- **Segurança & Autenticação:**
  - JWT (JSON Web Tokens) com Passport.js.
  - Criptografia de senhas com `bcryptjs`.
  - Proteção de cabeçalhos HTTP com `helmet` e limitação de taxa com `@nestjs/throttler`.
- **Upload e Processamento de Imagens:** Multer + `sharp` (compressão e otimização automática de fotos).
- **Documentação de API:** Swagger / OpenAPI 3.0 (disponível em `/api/docs`).

---

### 4. Banco de Dados & Infraestrutura em Nuvem
- **Banco de Dados:** Neon Serverless PostgreSQL (PostgreSQL 16 escalável em nuvem com conexões seguras SSL).
- **Arquitetura de Dados:**
  - `usuarios` (moradores, porteiros, síndicos e administradores).
  - `entregas` (encomendas com rastreio, foto, QR Code e status).
  - `visitantes_prestadores` (cadastros e registros de acesso).
  - `veiculos` (carros e motos autorizados vinculados a unidades).
  - `reservas_areas_comuns` (salão de festas, churrasqueiras, piscina).
  - `ocorrencias` (chamados, respostas e anexos).
  - `auditoria_lgpd` (logs imutáveis de ações e consentimento).
- **Portabilidade Total:** Scripts de inicialização automática em 1 clique (`INICIAR_VIA_PENDRIVE.bat` e `INICIAR_PRODUCAO.bat`) compatíveis com execução direta a partir de pen drives.

---

### 5. Módulo de Inteligência Artificial Integrado
- **IA Generativa de Comunicados:** Geração automática de avisos formais de condomínio (barulho, reformas, manutenções, assembleias).
- **Análise de Ocorrências:** Triagem inteligente e sugestões de respostas para a administração.

---

## 📱 Módulos e Funcionalidades em Detalhes

### 1. 📦 Módulo de Encomendas & Entregas
- Leitura de código de barras das principais transportadoras (Correios, Mercado Livre, Amazon, Jadlog, Loggi, etc.).
- Foto do comprovante anexada ao pacote.
- QR Code dinâmico de liberação gerado no celular do morador.
- Assinatura digital coletada na tela no ato da entrega.

---

### 2. 👥 Módulo de Visitantes, Prestadores & Convites
- **Convite Rápido:** O morador gera um convite com data e horário no próprio celular e envia pelo WhatsApp.
- **QR Code do Visitante:** Ao chegar na portaria, o visitante apresenta o código, agilizando o acesso em menos de 5 segundos.
- **Histórico Completo:** Auditoria de quem entrou, quem autorizou e horário exato de permanência.

---

### 3. 🚗 Módulo de Veículos & Garagem
- Cadastro de veículos vinculados a blocos e apartamentos.
- Visualização de placas no formato Mercosul e tradicional.
- Controle de lotação e ocupação de vagas da garagem.

---

### 4. 📅 Módulo de Reservas de Áreas Comuns
- Calendário interativo para reserva de Churrasqueira, Salão de Festas, Espaço Gourmet e Quadra.
- Seleção de períodos (*Manhã*, *Tarde*, *Noite*, *Integral*).
- Controle de lotação máxima e taxa de limpeza.

---

### 5. 📢 Módulo de Ocorrências & Comunicados com IA
- Morador registra reclamações ou solicitações de manutenção com fotos.
- Síndico responde diretamente pelo painel administrativo com status (*Aberto*, *Em Andamento*, *Resolvido*).
- **Assistente IA de Comunicados:** Redige comunicados condominiais em linguagem jurídica, amigável ou formal com 1 clique.

---

### 6. 🔒 Privacidade & Conformidade LGPD
- Consentimento explícito registrado digitalmente no 1º Acesso.
- Termos de uso e controle de privacidade integrados.
- Trilha de auditoria para exclusão ou anonimização de dados pessoais sob demanda.

---

## 👥 Perfis de Acesso e Credenciais de Demonstração

Para demonstração durante a apresentação, o sistema conta com 4 perfis pré-configurados:

| Perfil | E-mail | Senha Padrão | Funcionalidade Principal |
| :--- | :--- | :--- | :--- |
| **👤 Morador** | `morador@portaria.com` | `Morador@123456` | App mobile, convites QR, encomendas, reservas e chamados. |
| **👮 Porteiro** | `porteiro@portaria.com` | `Porteiro@123456` | Bipagem de encomendas, liberação de acessos e assinaturas. |
| **👔 Síndico** | `sindico@portaria.com` | `Sindico@123456` | Gestão de ocorrências, comunicados com IA e relatórios. |
| **⚙️ Administrador**| `admin@portaria.com` | `Admin@123456` | Controle de acessos, auditoria LGPD e configurações globais. |

---

## 🎬 Roteiro Sugerido para Apresentação ao Vivo (5 a 10 Minutos)

1. **Abertura (1 min):** Apresente o problema dos livros de papel e perda de encomendas nos condomínios.
2. **Demonstração do Porteiro (3 min):**
   - Acesse `http://localhost:3000` (Painel da Portaria).
   - Mostre o scanner de código de barras bipando uma encomenda e registrando para o Bloco A - Apto 101.
3. **Demonstração do Morador (3 min):**
   - Acesse `http://localhost:3002` (App do Morador).
   - Mostre a notificação instantânea da encomenda recebida.
   - Demonstre o **Modo Amplo** e crie um convite com QR Code para enviar por WhatsApp.
4. **Demonstração do Síndico & IA (2 min):**
   - Abra a aba de **Comunicados com IA** e gere um aviso de manutenção em 3 segundos.
5. **Conclusão & Segurança (1 min):**
   - Destaque a conformidade LGPD, a execução portátil por Pen Drive e o banco de dados em nuvem.

---

## 🏆 Diferenciais Competitivos do Projeto

- **100% Responsivo e Touch-First:** Funciona perfeitamente em computadores, tablets da portaria e celulares de qualquer tamanho.
- **Zero Custo de Licença Recorrente:** Arquitetura baseada em tecnologias de código aberto e nuvem Serverless gratuita.
- **Execução Portátil:** Pode ser levado em um Pen Drive e demonstrado em qualquer máquina Windows sem instalação.
- **Pronto para Produção:** Código tipado em TypeScript, modular e com testes de build 100% aprovados.
