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
} from 'lucide-react';
import { ConviteVisitante } from '@/lib/types';
import { CURRENT_MORADOR } from '@/lib/mobileStore';
import QRCodeDisplay from '@/components/QRCodeDisplay';

interface CriarConviteScreenProps {
  convites: ConviteVisitante[];
  onAddConvite: (convite: ConviteVisitante) => void;
}

export default function CriarConviteScreen({
  convites,
  onAddConvite,
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

    const tokenRandom = Math.random().toString(36).substring(2, 8).toUpperCase();
    const token = `QR-${tipoVisita}-${tokenRandom}-APT${CURRENT_MORADOR.apartamento}`;

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
    const formattedDate = new Date(invite.data_valida + 'T00:00:00').toLocaleDateString('pt-BR');
    const msg = `🎟️ *CONVITE DE ACESSO - CONDOMÍNIO RESIDENCIAL*\n\n` +
      `Olá *${invite.nome_convidado}*!\n` +
      `Você recebeu uma autorização de entrada para a unidade *Bloco ${CURRENT_MORADOR.bloco} - Apto ${CURRENT_MORADOR.apartamento}* (Morador: ${CURRENT_MORADOR.nome}).\n\n` +
      `📅 *Data de Validade:* ${formattedDate}\n` +
      `⏰ *Horário Permitido:* ${invite.hora_inicio} às ${invite.hora_fim}\n` +
      `🔐 *Token de Acesso Portaria:* \`${invite.qr_code_token}\`\n\n` +
      `📌 *Instruções:* Ao chegar na portaria, informe que possui convite com QR Code ou apresente este token para liberação automática.`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Cabeçalho */}
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          Gerar Convite com QR Code
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded-full">
            WhatsApp
          </span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Crie autorizações temporárias para visitantes, festas ou prestadores entrarem direto na portaria.
        </p>
      </div>

      {/* Convite recém-gerado com QR Code e Compartilhamento */}
      {generatedInvite && (
        <div className="p-5 rounded-3xl bg-gradient-to-b from-indigo-950/60 to-slate-900 border-2 border-indigo-500/50 shadow-2xl space-y-4 animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Convite Criado com Sucesso!
            </span>
            <button
              type="button"
              onClick={() => setGeneratedInvite(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Fechar
            </button>
          </div>

          <QRCodeDisplay
            token={generatedInvite.qr_code_token}
            title={generatedInvite.nome_convidado}
            subtitle={`Válido hoje: ${generatedInvite.hora_inicio} - ${generatedInvite.hora_fim}`}
          />

          {/* Botão de Compartilhar no WhatsApp */}
          <a
            href={generateWhatsAppUrl(generatedInvite)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            Compartilhar no WhatsApp do Convidado
          </a>
        </div>
      )}

      {/* Formulário de Novo Convite */}
      <form onSubmit={handleCreateInvite} className="bg-[#141D30] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Nome do Convidado / Prestador *
          </label>
          <input
            type="text"
            required
            value={nomeConvidado}
            onChange={(e) => setNomeConvidado(e.target.value)}
            placeholder="Ex: Lucas Mendes de Oliveira"
            className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tipo de Visita
            </label>
            <select
              value={tipoVisita}
              onChange={(e) => setTipoVisita(e.target.value as any)}
              className="w-full bg-slate-950 text-white text-xs px-2.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
            >
              <option value="VISITA">Visita Comum</option>
              <option value="FESTA_EVENTO">Festa / Churrasco</option>
              <option value="PRESTADOR_SERVICO">Prestador</option>
              <option value="ENTREGA">Entrega Especial</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Data de Validade
            </label>
            <input
              type="date"
              value={dataValida}
              onChange={(e) => setDataValida(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs px-2.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Entrada a partir de
            </label>
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs px-2.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Válido até
            </label>
            <input
              type="time"
              value={horaFim}
              onChange={(e) => setHoraFim(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs px-2.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
        >
          <QrCode className="w-4 h-4" />
          Gerar QR Code & Enviar no WhatsApp
        </button>
      </form>

      {/* Lista de Convites Ativos */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Convites Emitidos Recentemente ({convites.length})
        </h4>

        <div className="space-y-2.5">
          {convites.map((cnv) => (
            <div
              key={cnv.id}
              className="p-3.5 rounded-2xl bg-[#141D30] border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">{cnv.nome_convidado}</h5>
                  <p className="text-[11px] text-slate-400">
                    {cnv.hora_inicio} às {cnv.hora_fim} • {cnv.tipo_visita}
                  </p>
                </div>
              </div>

              <a
                href={generateWhatsAppUrl(cnv)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 transition-all"
                title="Reenviar via WhatsApp"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
