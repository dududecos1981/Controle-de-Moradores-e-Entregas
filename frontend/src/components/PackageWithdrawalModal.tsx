'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Package, UserCheck, Calendar, ShieldCheck } from 'lucide-react';
import { Encomenda } from '@/lib/types';
import { sounds } from '@/lib/SoundEffects';

interface PackageWithdrawalModalProps {
  encomenda: Encomenda | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmWithdrawal: (id: string, retiradoPorNome: string, retiradoPorDoc: string) => void;
}

export default function PackageWithdrawalModal({
  encomenda,
  isOpen,
  onClose,
  onConfirmWithdrawal,
}: PackageWithdrawalModalProps) {
  const [retiradoPor, setRetiradoPor] = useState(encomenda?.morador_nome || '');
  const [documento, setDocumento] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !encomenda) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retiradoPor.trim()) return;

    setIsSubmitting(true);
    sounds.playSuccessChime();

    setTimeout(() => {
      onConfirmWithdrawal(encomenda.id, retiradoPor, documento);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Baixa e Entrega de Encomenda</h3>
              <p className="text-xs text-slate-400">Confirmação de retirada pelo morador ou terceiro</p>
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

        {/* Detalhes do Pacote */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Unidade Destino:</span>
              <span className="text-xs font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/50 px-2.5 py-0.5 rounded-full">
                Bloco {encomenda.unidade_bloco} - Apto {encomenda.unidade_numero}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Destinatário:</span>
              <span className="text-xs font-semibold text-white">{encomenda.morador_nome}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Código / Rastreio:</span>
              <span className="text-xs font-mono font-medium text-cyan-400">{encomenda.codigo_barras_qrcode}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Transportadora:</span>
              <span className="text-xs text-slate-200">{encomenda.transportadora}</span>
            </div>
          </div>

          {/* Dados do Recebedor */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nome de Quem Está Retirando *
              </label>
              <input
                type="text"
                required
                value={retiradoPor}
                onChange={(e) => setRetiradoPor(e.target.value)}
                placeholder="Ex: Mariana Fernandes (própria moradora)"
                className="w-full bg-slate-950 text-white text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Documento de Identificação (RG / CPF)
              </label>
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ex: 111.222.333-44"
                className="w-full bg-slate-950 text-white text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Rodapé e Botões */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !retiradoPor.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Confirmar Entrega
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
