'use client';

import React, { useState } from 'react';
import { X, QrCode, PenTool, CheckCircle2, Truck, Clock, ShieldCheck, Package } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#101726] border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top bar / Handle */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Retirada de Encomenda</h3>
              <p className="text-[10px] text-slate-400 font-mono">{encomenda.codigo_barras_qrcode}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Foto e Detalhes do Pacote */}
          {encomenda.foto_comprovante_url && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={encomenda.foto_comprovante_url}
                alt="Foto do pacote na portaria"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-slate-950/80 backdrop-blur-sm rounded-lg text-[10px] font-semibold text-slate-300 border border-slate-800">
                Foto registrada na portaria
              </div>
            </div>
          )}

          {/* Abas: QR Code de Retirada vs Assinatura Digital */}
          {encomenda.status === 'AGUARDANDO_RETIRADA' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveMode('qrcode')}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeMode === 'qrcode'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  QR de Retirada
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('signature')}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeMode === 'signature'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PenTool className="w-4 h-4" />
                  Assinatura Digital
                </button>
              </div>

              {/* Modo 1: QR Code para Portaria Bipar */}
              {activeMode === 'qrcode' ? (
                <div className="text-center space-y-3">
                  <p className="text-xs text-slate-400">
                    Apresente este QR Code para o leitor da portaria dar baixa instantânea:
                  </p>
                  <QRCodeDisplay
                    token={encomenda.codigo_barras_qrcode}
                    title="QR Code de Retirada"
                    subtitle="Apresente na tela para a portaria"
                  />
                </div>
              ) : (
                /* Modo 2: Assinatura Touch Screen */
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Assine com o dedo abaixo para confirmar o recebimento em mãos:
                  </p>
                  <SignatureCanvas
                    onSignatureDone={(dataUrl) => setSignatureData(dataUrl)}
                  />
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!signatureData || confirmed}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {confirmed ? 'Confirmando...' : 'Confirmar Retirada com Assinatura'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Se já estiver retirado */}
          {encomenda.status === 'RETIRADO' && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-300">Encomenda Já Entregue</h4>
              <p className="text-xs text-slate-400">
                Retirada confirmada por <strong className="text-white">{encomenda.retirado_por_nome || 'Morador'}</strong>
              </p>
              {encomenda.data_retirada && (
                <p className="text-[11px] font-mono text-slate-500">
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
