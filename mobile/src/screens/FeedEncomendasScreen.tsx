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
} from 'lucide-react';
import { EncomendaMorador } from '@/lib/types';
import DetalhesEncomendaModal from './DetalhesEncomendaModal';

interface FeedEncomendasScreenProps {
  encomendas: EncomendaMorador[];
  onConfirmWithdrawal: (id: string, signatureUrl: string) => void;
}

export default function FeedEncomendasScreen({
  encomendas,
  onConfirmWithdrawal,
}: FeedEncomendasScreenProps) {
  const [selectedEncomenda, setSelectedEncomenda] = useState<EncomendaMorador | null>(null);
  const [realtimeNotification, setRealtimeNotification] = useState<{
    titulo: string;
    mensagem: string;
    tipo: 'ENCOMENDA' | 'VISITANTE';
  } | null>(null);

  const aguardando = encomendas.filter((e) => e.status === 'AGUARDANDO_RETIRADA');
  const retirados = encomendas.filter((e) => e.status === 'RETIRADO');

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
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-2 border-indigo-400/80 shadow-2xl shadow-indigo-500/20 animate-in slide-in-from-top-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              {realtimeNotification.titulo}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              Agora
            </span>
          </div>
          <p className="text-[11px] text-slate-300">{realtimeNotification.mensagem}</p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setRealtimeNotification(null)}
              className="text-[10px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded"
            >
              Dispensar
            </button>
            <button
              type="button"
              onClick={() => {
                if (aguardando.length > 0) setSelectedEncomenda(aguardando[0]);
                setRealtimeNotification(null);
              }}
              className="text-[10px] font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 px-3 py-1 rounded-lg shadow"
            >
              Ver no App
            </button>
          </div>
        </div>
      )}

      {/* Banner de Status WebSockets */}
      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          Canal WebSockets & Push Ativo
        </span>
        <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
          unidade_A_101
        </span>
      </div>

      {/* Seção: Aguardando Retirada */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Aguardando Retirada ({aguardando.length})
          </h3>
          <span className="text-[11px] text-indigo-400 font-semibold">Portaria 1</span>
        </div>

        {aguardando.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">Nenhum pacote pendente</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Você será notificado assim que uma entrega chegar na portaria.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {aguardando.map((enc) => (
              <div
                key={enc.id}
                onClick={() => setSelectedEncomenda(enc)}
                className="p-4 rounded-2xl bg-[#141D30] border border-amber-500/30 hover:border-amber-400/60 shadow-lg shadow-amber-500/5 transition-all active:scale-[0.98] cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={enc.foto_comprovante_url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60'}
                      alt="Pacote"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {enc.descricao_pacote || 'Volume / Pacote'}
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Truck className="w-3 h-3 text-indigo-400" />
                        {enc.transportadora}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/70 border border-amber-800/50 px-2 py-0.5 rounded-full shrink-0">
                    Aguardando
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60 text-[11px]">
                  <span className="font-mono text-cyan-400 text-[10px]">
                    {enc.codigo_barras_qrcode}
                  </span>
                  <span className="flex items-center gap-1 text-indigo-300 font-semibold text-xs">
                    <QrCode className="w-3.5 h-3.5" />
                    Abrir QR Code
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teste Interativo de Eventos em Tempo Real */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Testar Avisos Instantâneos (WebSockets / FCM):
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => simulateWebSocketEvent('ENCOMENDA')}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 text-left flex items-center gap-2 transition-all active:scale-95"
          >
            <Package className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Simular Nova Encomenda</span>
          </button>
          <button
            type="button"
            onClick={() => simulateWebSocketEvent('VISITANTE')}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 text-left flex items-center gap-2 transition-all active:scale-95"
          >
            <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Simular Chegada Visita</span>
          </button>
        </div>
      </div>

      {/* Seção: Encomendas Entregues Recentemente */}
      {retirados.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Histórico Recente ({retirados.length})
          </h3>
          <div className="space-y-2">
            {retirados.map((enc) => (
              <div
                key={enc.id}
                onClick={() => setSelectedEncomenda(enc)}
                className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-200">{enc.transportadora}</h5>
                    <p className="text-[10px] text-slate-500 font-mono">{enc.codigo_barras_qrcode}</p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-emerald-400">
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
