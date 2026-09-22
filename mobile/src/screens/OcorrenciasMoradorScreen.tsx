'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Plus,
  Wrench,
  Volume2,
  CheckCircle2,
  Clock,
  MessageSquare,
  X,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { OcorrenciaMorador } from '@/lib/types';

interface Props {
  ocorrencias: OcorrenciaMorador[];
  onAddOcorrencia: (nova: OcorrenciaMorador) => void;
}

export default function OcorrenciasMoradorScreen({ ocorrencias, onAddOcorrencia }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<'MANUTENCAO' | 'BARULHO' | 'GARAGEM' | 'OUTRO'>('MANUTENCAO');
  const [fotoUrl, setFotoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim()) return;

    const nova: OcorrenciaMorador = {
      id: `oc-m-${Date.now()}`,
      titulo,
      descricao,
      categoria,
      foto_url: fotoUrl || undefined,
      status: 'ABERTO',
      created_at: new Date().toISOString(),
    };

    onAddOcorrencia(nova);
    setTitulo('');
    setDescricao('');
    setFotoUrl('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Topo / Botão de Ação */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Livro de Ocorrências</h2>
          <p className="text-[11px] text-slate-400">Relate problemas ou manutenções ao síndico</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Abrir Chamado
        </button>
      </div>

      {/* Lista de Chamados */}
      <div className="space-y-3">
        {ocorrencias.map((oc) => (
          <div
            key={oc.id}
            className="bg-[#182238] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${
                    oc.categoria === 'MANUTENCAO'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : oc.categoria === 'BARULHO'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {oc.categoria === 'MANUTENCAO' ? (
                    <Wrench className="w-4 h-4" />
                  ) : oc.categoria === 'BARULHO' ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{oc.titulo}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {new Date(oc.created_at).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(oc.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  oc.status === 'RESOLVIDO'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : oc.status === 'EM_ANDAMENTO'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {oc.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              {oc.descricao}
            </p>

            {oc.resposta_sindico && (
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Resposta da Administração:
                </span>
                <p className="text-xs text-emerald-200">{oc.resposta_sindico}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Abertura de Chamado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#182238] border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-400" />
                Novo Chamado / Ocorrência
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Categoria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="MANUTENCAO">Manutenção / Reparo</option>
                  <option value="BARULHO">Barulho / Perturbação</option>
                  <option value="GARAGEM">Garagem / Vaga</option>
                  <option value="OUTRO">Outro Assunto</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Título do Relato *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  placeholder="Ex: Luz do corredor queimada"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Descrição dos Detalhes *
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                  rows={3}
                  placeholder="Descreva o que aconteceu..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md"
                >
                  Enviar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
