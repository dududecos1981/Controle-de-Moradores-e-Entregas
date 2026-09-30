'use client';

import React, { useState } from 'react';
import {
  X,
  QrCode,
  PenTool,
  CheckCircle2,
  Truck,
  Clock,
  ShieldCheck,
  Package,
  Copy,
  Check,
  User,
} from 'lucide-react';
import { EncomendaMorador } from '@/lib/types';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import SignatureCanvas from '@/components/SignatureCanvas';

interface DetalhesEncomendaModalProps {
  encomenda: EncomendaMorador | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmWithdrawal: (id: string, signatureDataUrl: string) => void;
}

export default function DetalhesEncomendaModal({
  encomenda,
  isOpen,
  onClose,
  onConfirmWithdrawal,
}: DetalhesEncomendaModalProps) {
  const [activeMode, setActiveMode] = useState<'qrcode' | 'signature'>('qrcode');
  const [signatureData, setSignatureData] = useState<string>('');
  const [confirmed, setConfirmed] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  if (!isOpen || !encomenda) return null;

  const handleConfirm = () => {
    if (activeMode === 'signature' && !signatureData) return;
    setConfirmed(true);
    setTimeout(() => {
      onConfirmWithdrawal(encomenda.id, signatureData);
      setConfirmed(false);
      onClose();
    }, 600);
  };

  const copyTracking = () => {
    const code = encomenda.codigo_rastreio || encomenda.codigo_barras_qrcode;
    if (code) {
      navigator.clipboard?.writeText(code);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#101726] border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top bar / Handle */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-snug">Retirada de Encomenda</h3>
              <p className="text-xs text-indigo-300 font-mono flex items-center gap-1.5 mt-0.5">
                <span>{encomenda.codigo_barras_qrcode}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 bg-slate-900/50 border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Foto e Detalhes do Pacote */}
          {encomenda.foto_comprovante_url && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={encomenda.foto_comprovante_url}
                alt="Foto do pacote na portaria"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2.5 left-2.5 px-3 py-1 bg-slate-950/85 backdrop-blur-sm rounded-xl text-xs font-semibold text-slate-200 border border-slate-800/80">
                📷 Foto do Pacote na Portaria
              </div>
            </div>
          )}

          {/* Dados Resumidos Amplos */}
          <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-400" />
                Transportadora
              </span>
              <span className="text-sm font-bold text-white">{encomenda.transportadora}</span>
            </div>

            {encomenda.descricao_pacote && (
              <div className="flex items-start justify-between gap-2 pt-2 border-t border-slate-800/60">
                <span className="text-xs font-semibold text-slate-400">Descrição</span>
                <span className="text-xs font-medium text-slate-200 text-right">{encomenda.descricao_pacote}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Recebido em
              </span>
              <span className="text-xs font-mono text-slate-300">
                {encomenda.data_recebimento ? new Date(encomenda.data_recebimento).toLocaleString('pt-BR') : 'Hoje'}
              </span>
            </div>

            {encomenda.codigo_rastreio && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="text-xs font-semibold text-slate-400">Rastreio</span>
                <button
                  type="button"
                  onClick={copyTracking}
                  className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300"
                >
                  <span>{encomenda.codigo_rastreio}</span>
                  {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Abas: QR Code de Retirada vs Assinatura Digital */}
          {encomenda.status === 'AGUARDANDO_RETIRADA' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveMode('qrcode')}
                  className={`flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                    activeMode === 'qrcode'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                  QR Code na Tela
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('signature')}
                  className={`flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                    activeMode === 'signature'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PenTool className="w-4 h-4 sm:w-5 sm:h-5" />
                  Assinar na Tela
                </button>
              </div>

              {/* Modo 1: QR Code para Portaria Bipar */}
              {activeMode === 'qrcode' ? (
                <div className="text-center space-y-3 pt-1">
                  <p className="text-xs sm:text-sm text-slate-300">
                    Apresente este QR Code para o leitor da portaria dar baixa instantânea:
                  </p>
                  <QRCodeDisplay
                    token={encomenda.codigo_barras_qrcode}
                    title="QR Code de Liberação"
                    subtitle="Apresente ao porteiro"
                  />
                </div>
              ) : (
                /* Modo 2: Assinatura Touch Screen Ampla */
                <div className="space-y-3 pt-1">
                  <p className="text-xs sm:text-sm text-slate-300">
                    Assine com o dedo no espaço abaixo para validar o recebimento:
                  </p>
                  <SignatureCanvas
                    onSignatureDone={(dataUrl) => setSignatureData(dataUrl)}
                    height={200}
                  />
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!signatureData || confirmed}
                    className="w-full min-h-[52px] py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {confirmed ? 'Confirmando Retirada...' : 'Confirmar Retirada com Assinatura'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Se já estiver retirado */}
          {encomenda.status === 'RETIRADO' && (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/40 text-center space-y-2.5">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-black text-emerald-300">Encomenda Já Entregue</h4>
              <p className="text-xs sm:text-sm text-slate-300">
                Retirada confirmada por <strong className="text-white">{encomenda.retirado_por_nome || 'Morador'}</strong>
              </p>
              {encomenda.data_retirada && (
                <p className="text-xs font-mono text-emerald-400/90 pt-1">
                  Data: {new Date(encomenda.data_retirada).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

