'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Share2,
  Calendar,
  Clock,
  UserCheck,
  Send,
  Sparkles,
  CheckCircle2,
  Copy,
  Plus,
  User,
  PartyPopper,
  Wrench,
  Truck,
  FileText,
  CreditCard,
} from 'lucide-react';
import { ConviteVisitante, ViewMode } from '@/lib/types';
import { CURRENT_MORADOR } from '@/lib/mobileStore';
import QRCodeDisplay from '@/components/QRCodeDisplay';

interface CriarConviteScreenProps {
  convites: ConviteVisitante[];
  onAddConvite: (convite: ConviteVisitante) => void;
  viewMode?: ViewMode;
}

const VISIT_TYPES = [
  {
    id: 'VISITA' as const,
    label: 'Visita Comum',
    desc: 'Familiares e amigos',
    icon: User,
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-300',
    activeColor: 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/25',
  },
  {
    id: 'FESTA_EVENTO' as const,
    label: 'Festa & Evento',
    desc: 'Churrasqueira ou salão',
    icon: PartyPopper,
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-300',
    activeColor: 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/25',
  },
  {
    id: 'PRESTADOR_SERVICO' as const,
    label: 'Prestador',
    desc: 'Técnicos, reformas, diaristas',
    icon: Wrench,
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
    activeColor: 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-500/25',
  },
  {
    id: 'ENTREGA' as const,
    label: 'Entrega Especial',
    desc: 'Móveis ou cargas pesadas',
    icon: Truck,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
    activeColor: 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/25',
  },
];

export default function CriarConviteScreen({
  convites,
  onAddConvite,
  viewMode = 'amplo',
}: CriarConviteScreenProps) {
  const [nomeConvidado, setNomeConvidado] = useState('');
  const [documento, setDocumento] = useState('');
  const [tipoVisita, setTipoVisita] = useState<ConviteVisitante['tipo_visita']>('VISITA');
  const [dataValida, setDataValida] = useState(new Date().toISOString().split('T')[0]);
  const [horaInicio, setHoraInicio] = useState('12:00');
  const [horaFim, setHoraFim] = useState('22:00');
  const [observacoes, setObservacoes] = useState('');

  const [generatedInvite, setGeneratedInvite] = useState<ConviteVisitante | null>(null);

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeConvidado.trim()) return;

    let authUser: any = CURRENT_MORADOR;
    try {
      const saved = localStorage.getItem('morador_auth_user');
      if (saved) authUser = JSON.parse(saved);
    } catch (e) {}

    const tokenRandom = Math.random().toString(36).substring(2, 8).toUpperCase();
    const token = `QR-${tipoVisita.slice(0, 3)}-${tokenRandom}-APT${authUser.apartamento || '101'}`;

    const novoConvite: ConviteVisitante = {
      id: `cnv-${Date.now()}`,
      nome_convidado: nomeConvidado.trim(),
      documento: documento.trim() || undefined,
      tipo_visita: tipoVisita,
      data_valida: dataValida,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      qr_code_token: token,
      status: 'ATIVO',
      created_at: new Date().toISOString(),
      observacoes: observacoes.trim() || undefined,
    };

    onAddConvite(novoConvite);
    setGeneratedInvite(novoConvite);

    // Reset fields
    setNomeConvidado('');
    setDocumento('');
    setObservacoes('');
  };

  // Gerador de mensagem formatada para o WhatsApp
  const generateWhatsAppUrl = (invite: ConviteVisitante) => {
    let authUser: any = CURRENT_MORADOR;
    try {
      const saved = localStorage.getItem('morador_auth_user');
      if (saved) authUser = JSON.parse(saved);
    } catch (e) {}

    const formattedDate = new Date(invite.data_valida + 'T00:00:00').toLocaleDateString('pt-BR');
    const msg =
      `🎟️ *CONVITE DE ACESSO - CONDOMÍNIO RESIDENCIAL*\n\n` +
      `Olá *${invite.nome_convidado}*!\n` +
      `Você recebeu uma autorização de entrada para a unidade *Bloco ${authUser.bloco || 'A'} - Apto ${authUser.apartamento || 'S/N'}* (Morador: ${authUser.nome || 'Morador'}).\n\n` +
      `📅 *Data de Validade:* ${formattedDate}\n` +
      `⏰ *Horário Permitido:* ${invite.hora_inicio} às ${invite.hora_fim}\n` +
      `🔐 *Token de Acesso Portaria:* \`${invite.qr_code_token}\`\n\n` +
      `📌 *Instruções:* Ao chegar na portaria, informe que possui convite com QR Code ou apresente este token para liberação automática.`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Cabeçalho Amplo */}
      <div>
        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <span>Gerar Convite com QR Code</span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-0.5 rounded-full">
            WhatsApp
          </span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
          Crie autorizações temporárias para visitantes ou prestadores entrarem direto na portaria sem filas.
        </p>
      </div>

      {/* Convite recém-gerado com QR Code e Compartilhamento */}
      {generatedInvite && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-indigo-950/80 via-slate-900 to-indigo-950/80 border-2 border-indigo-400 shadow-2xl space-y-4 animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs sm:text-sm font-black text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              Convite Criado com Sucesso!
            </span>
            <button
              type="button"
              onClick={() => setGeneratedInvite(null)}
              className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 px-3 py-1 rounded-xl"
            >
              Fechar
            </button>
          </div>

          <QRCodeDisplay
            token={generatedInvite.qr_code_token}
            title={generatedInvite.nome_convidado}
            subtitle={`Válido hoje: ${generatedInvite.hora_inicio} - ${generatedInvite.hora_fim}`}
          />

          {/* Botão de Compartilhar no WhatsApp Amplo */}
          <a
            href={generateWhatsAppUrl(generatedInvite)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[52px] py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 active:scale-98 transition-all"
          >
            <Send className="w-5 h-5" />
            <span>Compartilhar no WhatsApp do Convidado</span>
          </a>
        </div>
      )}

      {/* Formulário com Campos Amplos */}
      <form
        onSubmit={handleCreateInvite}
        className="bg-[#141D30] border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5"
      >
        {/* Seletor de Tipo de Visita Amplo (Cards Grandes Clicáveis) */}
        <div className="space-y-2.5">
          <label className="block text-xs sm:text-sm font-black text-slate-200 uppercase tracking-wider">
            Tipo de Acesso *
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {VISIT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = tipoVisita === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setTipoVisita(type.id)}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? type.activeColor
                      : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon className="w-5 h-5" />
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black">{type.label}</h5>
                    <p className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      {type.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nome do Convidado */}
        <div className="space-y-1.5">
          <label className="block text-xs sm:text-sm font-bold text-slate-200">
            Nome Completo do Convidado ou Prestador *
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={nomeConvidado}
              onChange={(e) => setNomeConvidado(e.target.value)}
              placeholder="Ex: Lucas Mendes de Oliveira"
              className="w-full min-h-[52px] bg-slate-950 text-white text-sm sm:text-base pl-12 pr-4 py-3.5 rounded-2xl border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Documento Opcional */}
        <div className="space-y-1.5">
          <label className="block text-xs sm:text-sm font-bold text-slate-200">
            Documento / CPF (Opcional para maior agilidade)
          </label>
          <div className="relative">
            <CreditCard className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder="000.000.000-00 ou RG"
              className="w-full min-h-[52px] bg-slate-950 text-white text-sm sm:text-base pl-12 pr-4 py-3.5 rounded-2xl border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Data e Horários Amplos */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-slate-200">
              Data de Validade da Entrada *
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={dataValida}
                onChange={(e) => setDataValida(e.target.value)}
                className="w-full min-h-[52px] bg-slate-950 text-white text-sm sm:text-base pl-12 pr-4 py-3.5 rounded-2xl border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-slate-200">
                Horário Inicial *
              </label>
              <div className="relative">
                <Clock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full min-h-[52px] bg-slate-950 text-white text-sm sm:text-base pl-12 pr-4 py-3.5 rounded-2xl border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-slate-200">
                Horário Limite *
              </label>
              <div className="relative">
                <Clock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className="w-full min-h-[52px] bg-slate-950 text-white text-sm sm:text-base pl-12 pr-4 py-3.5 rounded-2xl border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-1.5">
          <label className="block text-xs sm:text-sm font-bold text-slate-200">
            Observações para a Portaria (Opcional)
          </label>
          <textarea
            rows={2}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex: Vai participar do churrasco na torre A, vaga liberada..."
            className="w-full bg-slate-950 text-white text-sm sm:text-base p-4 rounded-2xl border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Botão de Envio Amplo */}
        <button
          type="submit"
          className="w-full min-h-[54px] py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-500/30 active:scale-98 transition-all flex items-center justify-center gap-2.5"
        >
          <QrCode className="w-5 h-5" />
          <span>Gerar QR Code & Liberar Convite</span>
        </button>
      </form>

      {/* Lista de Convites Ativos */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300">
            Convites Emitidos Recentemente ({convites.length})
          </h4>
        </div>

        <div className="space-y-3">
          {convites.map((cnv) => (
            <div
              key={cnv.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#141D30] border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-inner">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-sm font-bold text-white truncate">{cnv.nome_convidado}</h5>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {cnv.hora_inicio} às {cnv.hora_fim} • {cnv.tipo_visita}
                  </p>
                </div>
              </div>

              <a
                href={generateWhatsAppUrl(cnv)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 font-bold text-xs transition-all shrink-0"
                title="Reenviar via WhatsApp"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

