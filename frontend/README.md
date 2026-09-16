# Portaria Pro - Frontend Web (Next.js + Tailwind CSS)

> **Interface Operacional para Portarias de Condomínios e Edifícios**  
> **Tecnologias:** Next.js (App Router), React 18, Tailwind CSS, Lucide Icons, Web Audio API

---

## 🚀 Funcionalidades Principais

### 1. 📷 Cadastro Rápido de Visitantes e Prestadores (com Webcam)
- **Captura Fotográfica em Tempo Real:** Conexão nativa com webcam e câmeras USB via `navigator.mediaDevices.getUserMedia`.
- **Moldura Biométrica Facial:** Guia visual centralizada para enquadramento ideal de rostos.
- **Temporizador de 3s & Efeito Flash:** Efeito visual de disparo e som de obturador via Web Audio API.
- **Upload Manual:** Suporte alternativo a upload de arquivos de imagem por drag-and-drop.
- **Lista de Visitantes Presentes:** Painel lateral em tempo real com contagem de visitantes no local e botão para registrar saída.

### 2. ⚡ Registro de Encomendas com Leitor Óptico (USB + Câmera)
- **Leitor de Código de Barras USB (Teclado Wedge):** Escuta buffers de digitação ultra-rápidos e faz a captura automática sem exigir foco manual no input.
- **Scanner Óptico por Câmera:** Linha laser animada para mirar em códigos de barras e QR Codes de encomendas.
- **Feedback Sonoro Imediato:** Bip clássico de leitor óptico (1760Hz) ao detectar código válido.
- **Associação Rápida de Unidade:** Preenchimento automático do morador conforme bloco e apartamento selecionados.

### 3. 📊 Dashboard de Encomendas em Tempo Real
- **Cards de Métricas:**
  - *Aguardando Retirada* (com badge pulsante e alerta visual)
  - *Entregues / Baixadas*
  - *Total Registrado no Histórico*
  - *Visitantes Ativos no Condomínio*
- **Filtros e Busca Instantânea:** Busca por morador, código de barras, bloco, unidade ou transportadora.
- **Modal de Baixa de Encomenda:** Formulário rápido para registrar o nome de quem retirou, documento de identificação e som de confirmação.

---

## 💻 Como Rodar o Front-end

```bash
cd frontend
npm install
npm run dev
```

Abra no navegador em: `http://localhost:3000`
