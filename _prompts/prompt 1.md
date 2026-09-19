# Prompt — Autenticação & Controle de Acesso Multi-Perfil (SUPE)

Vamos implementar o módulo completo de **Autenticação, Sessão Segura e Cadastro de Moradores** para o **Sistema de Gestão de Portaria, Moradores e Entregas (SUPE)**.

O sistema deve permitir login seguro com controle de perfis (RBAC) integrado ao banco de dados **PostgreSQL (Neon Serverless)** e rotas protegidas no **Next.js**.

---

## 🏛️ Perfis de Acesso (RBAC)
1. **PORTEIRO:** Acesso direto ao Painel da Portaria (encomendas, visitantes, prestadores, comunicados com IA).
2. **MORADOR:** Acesso ao App do Morador (feed de encomendas da sua unidade, QR Code de retirada, criação de convites com QR Code).
3. **ADMINISTRADOR / SINDICO:** Acesso irrestrito ao painel com gestão de condomínio, relatórios de acesso e auditoria LGPD.

---

## 🔐 1. Tela de Login (`/login`)
- **Seletor de Tipo de Acesso:** Portaria / Administração ou Morador (ou detecção automática por e-mail/CPF).
- **Campo de Identificação:** E-mail institucional ou CPF.
- **Campo de Senha:** Input com botão de alternar visibilidade (mostrar/ocultar senha com ícone de olho).
- **Checkbox:** "Lembrar meu acesso neste dispositivo".
- **Botão Principal:** "Entrar no Sistema".
- **Link Secundário:** "É morador e ainda não tem acesso? Cadastre sua unidade".
- **Aviso de Segurança / LGPD:** Rodapé indicando conexão criptografada SSL nativa e política de privacidade.

---

## 📝 2. Tela de Cadastro de Morador (`/cadastro`)
- **Campo de Nome Completo**
- **Campo de CPF** (com máscara automática `000.000.000-00` e validação)
- **Campo de E-mail**
- **Campo de Telefone / WhatsApp** (com máscara `(00) 00000-0000`)
- **Seleção de Unidade Residencial:**
  - Seletor de Bloco / Torre (Ex: Bloco A, Bloco B)
  - Seletor de Número do Apartamento (Ex: 101, 102, 201, PH01)
- **Campo de Senha** (mínimo de 6 a 8 caracteres com indicador de força)
- **Campo de Confirmar Senha**
- **Termo de Consentimento LGPD (Obrigatório):**
  - Checkbox explícito: *"Concordo com o armazenamento seguro dos meus dados para controle de acesso predial, biometria e recebimento de notificações de encomendas conforme a Lei nº 13.709/2018 (LGPD)."*
- **Botão:** "Concluir Cadastro"
- **Link:** "Já possui cadastro? Fazer login"

---

## ⚙️ Regras de Negócio & Segurança
1. **Banco de Dados (Neon PostgreSQL):**
   - No cadastro de morador, salvar os dados na tabela `usuarios` vinculados à `unidade_id` correspondente.
   - Criptografar a senha com hash seguro (`bcrypt`).
   - Gravar auditoria LGPD (`lgpd_termo_aceito: true`, `lgpd_data_aceite: NOW()`, `lgpd_versao_termo: '1.0'`).
2. **Redirecionamento Inteligente pós-login:**
   - Se o usuário for **PORTEIRO**, **SINDICO** ou **ADMINISTRADOR** ➔ Redirecionar imediatamente para o **Dashboard da Portaria (`/`)**.
   - Se o usuário for **MORADOR** ➔ Redirecionar para o **App do Morador (`/mobile` ou porta 3001)** filtrando apenas os dados da sua unidade (RLS).
3. **Persistência de Sessão:**
   - Manter a sessão salva com JWT / Tokens seguros para que o porteiro ou morador não precise logar toda vez que recarregar a página.
   - Se o usuário já estiver logado e tentar abrir `/login`, redirecionar direto para o seu respectivo painel.
4. **Tratamento de Erros:**
   - Mensagens visuais claras com feedback (ex: *"E-mail ou senha incorretos"*, *"CPF já cadastrado no sistema"*, *"As senhas informadas não coincidem"*).
   - Efeitos sonoros sutis de sucesso ou alerta de login.

---

## 🎨 Design & Estilo Visual
- **Tema:** Dark mode corporativo ultra-moderno e seguro (fundo `#070A11` e `#0F172A`).
- **Paleta de Cores:** Destaques em **Azul Real (`#2563EB`)**, **Ciano (`#06B6D4`)** e **Índigo**, transmitindo segurança, alta tecnologia e confiabilidade.
- **Identidade:** Badge com escudo e logotipo **"SUPE — Controle de Portaria & Acesso Inteligente"**.
- **Componentes:** Efeito glassmorphism, inputs com foco iluminado, transições suaves e responsividade perfeita em desktop, tablets e smartphones.
