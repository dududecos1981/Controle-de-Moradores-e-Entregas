/**
 * Utilitários de Mascaramento e Proteção de Dados LGPD
 */

/**
 * Mascara um CPF mantendo apenas dígitos centrais ou ocultando extremidades para conformidade LGPD
 * Exemplo: "123.456.789-00" -> "***.456.789-**"
 */
export function maskCpf(cpf?: string | null, reveal: boolean = false): string {
  if (!cpf) return '-';
  if (reveal) return formatCpf(cpf);

  const clean = cpf.replace(/\D/g, '');
  if (clean.length === 11) {
    return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
  }
  return '***.***.***-**';
}

/**
 * Formata CPF padrão: 000.000.000-00
 */
export function formatCpf(cpf?: string | null): string {
  if (!cpf) return '-';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length === 11) {
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
  }
  return cpf;
}

/**
 * Mascara Telefone / WhatsApp para proteção de contato
 * Exemplo: "(11) 98765-4321" -> "(11) 9****-**21"
 */
export function maskPhone(phone?: string | null, reveal: boolean = false): string {
  if (!phone) return '-';
  if (reveal) return formatPhone(phone);

  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 10) {
    const ddd = clean.slice(0, 2);
    const lastDigits = clean.slice(-2);
    return `(${ddd}) 9****-**${lastDigits}`;
  }
  return '(**) *****-****';
}

/**
 * Formata telefone padrão: (00) 00000-0000 ou (00) 0000-0000
 */
export function formatPhone(phone?: string | null): string {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6, 10)}`;
  }
  return phone;
}

/**
 * Mascara endereço de e-mail
 * Exemplo: "usuario@dominio.com" -> "u*****o@dominio.com"
 */
export function maskEmail(email?: string | null, reveal: boolean = false): string {
  if (!email || !email.includes('@')) return email || '-';
  if (reveal) return email;

  const [name, domain] = email.split('@');
  if (name.length <= 2) {
    return `*@${domain}`;
  }
  const first = name[0];
  const last = name[name.length - 1];
  return `${first}*****${last}@${domain}`;
}
