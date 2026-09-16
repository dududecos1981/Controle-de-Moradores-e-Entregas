# Morador Pro - Aplicativo do Morador (Mobile Web / React Native Ready)

> **Interface do Morador para Gestão de Encomendas & Convites com QR Code**  
> **Tecnologias:** React 18, Next.js App Router, Tailwind CSS, Lucide Icons, Canvas API

---

## 📱 Funcionalidades do Aplicativo do Morador

### 1. 📦 Feed de Encomendas em Tempo Real
- **Status ao Vivo:** Encomendas classificadas em *Aguardando Retirada* (com badge âmbar) e *Entregues* (badge verde).
- **Foto da Portaria:** Visualização instantânea da foto do pacote capturada pelo porteiro no momento do recebimento.
- **Notificação Automática:** Banner de destaque com contagem de pacotes aguardando retirada.

### 2. 🎟️ Geração de Convites com QR Code & Compartilhamento via WhatsApp
- **Geração Segura:** Emissão de tokens de acesso com janela de data e horário (visita comum, festa/evento, prestador).
- **Compartilhamento 1-Clique no WhatsApp:** Cria mensagem pré-formatada pronta para envio direto ao contato do convidado contendo instruções e token de liberação.
- **Renderizador de QR Code:** QR Code em alta definição para exibição na tela do smartphone na portaria.

### 3. ✍️ Confirmação e Baixa com Assinatura Digital Touch & QR Code
- **Apresentação de QR Code de Retirada:** O morador pode exibir o QR Code do pacote para o porteiro bipar com o leitor óptico.
- **Assinatura Digital no Touch Screen:** Canvas interativo com suporte a traço por toque do dedo ou caneta stylus para confirmação formal de entrega.

---

## 🚀 Como Executar o App do Morador

```bash
cd mobile
npm install
npm run dev
```

Acesse no navegador: `http://localhost:3001`
