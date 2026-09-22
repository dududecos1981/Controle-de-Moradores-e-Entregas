/**
 * Utilitário de Notificações Diretas via WhatsApp (1-Clique)
 * Gera links universais wa.me com formatação de mensagens amigáveis e emojis.
 */

export interface WhatsAppPackageData {
  moradorNome: string;
  telefone?: string;
  bloco: string;
  apartamento: string;
  transportadora?: string;
  codigoPacote: string;
  porteiroNome?: string;
  descricaoPacote?: string;
}

export interface WhatsAppVisitorData {
  moradorNome: string;
  telefone?: string;
  bloco: string;
  apartamento: string;
  visitanteNome: string;
  visitanteTipo?: string;
  empresa?: string;
  placaVeiculo?: string;
}

export class WhatsAppNotification {
  /**
   * Sanitiza e formata número de telefone brasileiro para o padrão internacional do WhatsApp (55 + DDD + 9 dígitos)
   */
  static formatPhoneNumber(phone?: string): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 || digits.length === 10) {
      return `55${digits}`;
    }
    if (digits.startsWith('55') && digits.length >= 12) {
      return digits;
    }
    return digits;
  }

  /**
   * Gera link do WhatsApp para aviso de encomenda recebida na portaria
   */
  static getPackageNotificationUrl(data: WhatsAppPackageData): string {
    const phone = this.formatPhoneNumber(data.telefone);
    const transportadora = data.transportadora || 'Transportadora';
    const porteiro = data.porteiroNome || 'Portaria do Condomínio';
    const descricao = data.descricaoPacote ? `📦 *Pacote:* ${data.descricaoPacote}\n` : '';

    const message = `🔔 *Olá, ${data.moradorNome}!*
Informamos que uma encomenda sua acaba de ser recebida na portaria.

${descricao}🏢 *Unidade:* Bloco ${data.bloco} - Apto ${data.apartamento}
🚚 *Transportadora:* ${transportadora}
🏷️ *Código/Rastreio:* \`${data.codigoPacote}\`
👮 *Recebido por:* ${porteiro}
⏰ *Data/Hora:* ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}

👉 *Para retirar:* Apresente seu documento ou o QR Code no App do Morador na portaria.

_Mensagem automática do Sistema de Portaria e Entregas._`;

    const encodedMessage = encodeURIComponent(message);
    if (phone) {
      return `https://wa.me/${phone}?text=${encodedMessage}`;
    }
    return `https://wa.me/?text=${encodedMessage}`;
  }

  /**
   * Gera link do WhatsApp para aviso de visitante/prestador na portaria
   */
  static getVisitorNotificationUrl(data: WhatsAppVisitorData): string {
    const phone = this.formatPhoneNumber(data.telefone);
    const tipo = data.visitanteTipo || 'Visitante';
    const empresa = data.empresa ? `\n🏢 *Empresa:* ${data.empresa}` : '';
    const veiculo = data.placaVeiculo ? `\n🚗 *Veículo/Placa:* ${data.placaVeiculo}` : '';

    const message = `🚪 *Olá, ${data.moradorNome}!*
Há uma pessoa na portaria aguardando autorização para sua unidade (Bloco ${data.bloco} - Apto ${data.apartamento}).

👤 *Nome:* *${data.visitanteNome}*
🏷️ *Tipo:* ${tipo}${empresa}${veiculo}
⏰ *Horário:* ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}

👉 Por favor, responda se autoriza a entrada ou libere diretamente pelo seu *App do Morador*.`;

    const encodedMessage = encodeURIComponent(message);
    if (phone) {
      return `https://wa.me/${phone}?text=${encodedMessage}`;
    }
    return `https://wa.me/?text=${encodedMessage}`;
  }
}
