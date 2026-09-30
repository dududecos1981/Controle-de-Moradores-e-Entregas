'use client';

import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  QrCode,
  Bell,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  UserCheck,
  Radio,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import { EncomendaMorador, ViewMode } from '@/lib/types';
import DetalhesEncomendaModal from './DetalhesEncomendaModal';

interface FeedEncomendasScreenProps {
  encomendas: EncomendaMorador[];
  onConfirmWithdrawal: (id: string, signatureUrl: string) => void;
  viewMode?: ViewMode;
}

export default function FeedEncomendasScreen({
  encomendas,
  onConfirmWithdrawal,
  viewMode = 'amplo',
}: FeedEncomendasScreenProps) {
  const [selectedEncomenda, setSelectedEncomenda] = useState<EncomendaMorador | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [realtimeNotification, setRealtimeNotification] = useState<{
    titulo: string;
    mensagem: string;
    tipo: 'ENCOMENDA' | 'VISITANTE';
  } | null>(null);

  const filtered = encomendas.filter((e) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.transportadora?.toLowerCase().includes(term) ||
      e.codigo_rastreio?.toLowerCase().includes(term) ||
      e.codigo_barras_qrcode?.toLowerCase().includes(term) ||
      e.descricao_pacote?.toLowerCase().includes(term)
    );
  });

  const aguardando = filtered.filter((e) => e.status === 'AGUARDANDO_RETIRADA');
  const retirados = filtered.filter((e) => e.status === 'RETIRADO');

  const copyCode = (e: React.MouseEvent, code: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Simulação de evento recebido via WebSockets / Push FCM
  const simulateWebSocketEvent = (tipo: 'ENCOMENDA' | 'VISITANTE') => {
    if (tipo === 'ENCOMENDA') {
      setRealtimeNotification({
        tipo: 'ENCOMENDA',
        titulo: '📦 Nova Entrega na Portaria!',
        mensagem: 'Um pacote Mercado Livre Express acaba de ser recebido pelo porteiro João para a sua unidade.',
      });
    } else {
      setRealtimeNotification({
        tipo: 'VISITANTE',
        titulo: '👤 Visitante na Portaria!',
        mensagem: 'Lucas Mendes de Oliveira chegou e aguarda sua autorização de entrada.',
      });
    }

    setTimeout(() => {
      setRealtimeNotification(null);
    }, 6000);
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Toast / Alerta Flutuante de Notificação Push & WebSockets em Tempo Real */}
      {realtimeNotification && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-2 border-indigo-400 shadow-2xl shadow-indigo-500/30 animate-in slide-in-from-top-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs sm:text-sm font-black text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              {realtimeNotification.titulo}
            </span>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-700/60">
              Agora
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{realtimeNotification.mensagem}</p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setRealtimeNotification(null)}
              className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl"
            >
              Dispensar
            </button>
            <button
              type="button"
              onClick={() => {
                if (aguardando.length > 0) setSelectedEncomenda(aguardando[0]);
                setRealtimeNotification(null);
              }}
              className="text-xs font-black text-slate-950 bg-cyan-400 hover:bg-cyan-300 px-4 py-2 rounded-xl shadow-lg transition-transform active:scale-95"
            >
              Ver Detalhes
            </button>
          </div>
        </div>
      )}

      {/* Campo de Busca Amplo */}
      <div className="relative w-full">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar encomenda, rastreio ou loja..."
          className="w-full bg-slate-900/90 text-white text-sm sm:text-base pl-12 pr-4 py-3.5 rounded-2xl border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-slate-500 shadow-inner"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded-lg"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Status WebSockets */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-slate-300 font-medium">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Recepção em Tempo Real Ativa</span>
        </span>
        <span className="font-mono text-xs text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-800/50">
          Portaria Conectada
        </span>
      </div>

      {/* Seção: Aguardando Retirada */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            Aguardando Retirada ({aguardando.length})
          </h3>
          <span className="text-xs text-indigo-300 font-bold bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-800/40">
            Pronto para Retirar
          </span>
        </div>

        {aguardando.length === 0 ? (
          <div className="p-10 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
              <Package className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-200">Nenhum pacote pendente</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Assim que uma entrega chegar na portaria para o seu apartamento, você receberá um aviso imediato com QR Code.
            </p>
          </div>
        ) : viewMode === 'amplo' ? (
          /* MODO AMPLO: Cartões Expandidos e Ricos */
          <div className="space-y-4">
            {aguardando.map((enc) => (
              <div
                key={enc.id}
                onClick={() => setSelectedEncomenda(enc)}
                className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#162035] to-[#121a2c] border-2 border-amber-500/40 hover:border-amber-400 shadow-xl shadow-amber-500/10 transition-all active:scale-[0.99] cursor-pointer space-y-4"
              >
                {/* Header do Card Amplo */}
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        enc.foto_comprovante_url ||
                        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60'
                      }
                      alt="Foto do pacote"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-700/80 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-lg text-slate-950 shadow">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                        <Truck className="w-3.5 h-3.5 text-indigo-400" />
                        {enc.transportadora}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/50 shrink-0">
                        Pendente
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white truncate pt-0.5">
                      {enc.descricao_pacote || 'Pacote / Volume'}
                    </h4>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Recebido:{' '}
                      {enc.data_recebimento
                        ? new Date(enc.data_recebimento).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                          })
                        : 'Hoje'}
                    </p>
                  </div>
                </div>

                {/* Bloco de Código e Rastreio Amplo */}
                <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Código de Liberação
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-black text-cyan-300 tracking-wider truncate block">
                      {enc.codigo_barras_qrcode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => copyCode(e, enc.codigo_barras_qrcode, enc.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors shrink-0"
                  >
                    {copiedId === enc.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Botão de Ação Direta Amplo */}
                <button
                  type="button"
                  onClick={() => setSelectedEncomenda(enc)}
                  className="w-full min-h-[48px] py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Abrir QR Code & Retirar Encomenda</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* MODO COMPACTO */
          <div className="space-y-2">
            {aguardando.map((enc) => (
              <div
                key={enc.id}
                onClick={() => setSelectedEncomenda(enc)}
                className="p-3.5 rounded-2xl bg-[#141D30] border border-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">
                      {enc.transportadora} - {enc.descricao_pacote || 'Pacote'}
                    </h5>
                    <p className="text-[11px] font-mono text-cyan-400 truncate">
                      {enc.codigo_barras_qrcode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800/60">
                    Pendente
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teste Interativo de Eventos em Tempo Real */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Testar Avisos Instantâneos (WebSockets & Push):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => simulateWebSocketEvent('ENCOMENDA')}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs sm:text-sm font-bold border border-slate-700 text-left flex items-center gap-2.5 transition-all active:scale-95 shadow-sm"
          >
            <Package className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Simular Nova Encomenda</span>
          </button>
          <button
            type="button"
            onClick={() => simulateWebSocketEvent('VISITANTE')}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs sm:text-sm font-bold border border-slate-700 text-left flex items-center gap-2.5 transition-all active:scale-95 shadow-sm"
          >
            <UserCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>Simular Chegada Visita</span>
          </button>
        </div>
      </div>

      {/* Seção: Encomendas Entregues Recentemente */}
      {retirados.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 px-1">
            Histórico Recente de Entregas ({retirados.length})
          </h3>
          <div className="space-y-2.5">
            {retirados.map((enc) => (
              <div
                key={enc.id}
                onClick={() => setSelectedEncomenda(enc)}
                className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/70 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                      {enc.transportadora} {enc.descricao_pacote ? `• ${enc.descricao_pacote}` : ''}
                    </h5>
                    <p className="text-xs text-slate-400 font-mono truncate">
                      {enc.codigo_barras_qrcode}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-800/40 shrink-0">
                  Entregue
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Detalhes e Assinatura */}
      <DetalhesEncomendaModal
        encomenda={selectedEncomenda}
        isOpen={!!selectedEncomenda}
        onClose={() => setSelectedEncomenda(null)}
        onConfirmWithdrawal={onConfirmWithdrawal}
      />
    </div>
  );
}

