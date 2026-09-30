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
  ShieldAlert,
  Car,
  ChevronRight,
  Send,
} from 'lucide-react';
import { OcorrenciaMorador, ViewMode } from '@/lib/types';

interface Props {
  ocorrencias: OcorrenciaMorador[];
  onAddOcorrencia: (nova: OcorrenciaMorador) => void;
  viewMode?: ViewMode;
}

const CATEGORIES = [
  {
    id: 'MANUTENCAO' as const,
    label: 'Manutenção & Reparo',
    desc: 'Lâmpadas, elevador, portão',
    icon: Wrench,
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    activeColor: 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/25',
  },
  {
    id: 'BARULHO' as const,
    label: 'Barulho & Perturbação',
    desc: 'Som alto, festas, reformas',
    icon: Volume2,
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    activeColor: 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-500/25',
  },
  {
    id: 'GARAGEM' as const,
    label: 'Garagem & Estacionamento',
    desc: 'Vaga ocupada, bloqueio',
    icon: Car,
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    activeColor: 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-500/25',
  },
  {
    id: 'OUTRO' as const,
    label: 'Outros Assuntos',
    desc: 'Limpeza, segurança, áreas',
    icon: AlertCircle,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    activeColor: 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/25',
  },
];

export default function OcorrenciasMoradorScreen({
  ocorrencias,
  onAddOcorrencia,
  viewMode = 'amplo',
}: Props) {
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
    <div className="space-y-5 pb-20">
      {/* Topo / Botão de Ação Amplo */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white">Livro de Ocorrências</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Relate problemas ou manutenções ao síndico</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="min-h-[44px] bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Chamado</span>
        </button>
      </div>

      {/* Lista de Chamados Amplos */}
      <div className="space-y-3.5">
        {ocorrencias.length === 0 ? (
          <div className="p-10 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-slate-200">Nenhum chamado aberto</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Seu condomínio não possui pendências registradas para sua unidade no momento.
            </p>
          </div>
        ) : (
          ocorrencias.map((oc) => {
            const cat = CATEGORIES.find((c) => c.id === oc.categoria) || CATEGORIES[3];
            const Icon = cat.icon;

            return (
              <div
                key={oc.id}
                className="bg-[#141D30] border-2 border-slate-800/90 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs shrink-0 border ${cat.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">{oc.titulo}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {new Date(oc.created_at).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(oc.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full border shrink-0 ${
                      oc.status === 'RESOLVIDO'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : oc.status === 'EM_ANDAMENTO'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {oc.status === 'ABERTO' ? 'Em Aberto' : oc.status === 'EM_ANDAMENTO' ? 'Em Análise' : 'Resolvido'}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-slate-200 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 leading-relaxed">
                  {oc.descricao}
                </div>

                {oc.resposta_sindico && (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3.5 space-y-1.5">
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" /> Resposta da Administração:
                    </span>
                    <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                      {oc.resposta_sindico}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Abertura de Chamado Amplo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-[#141D30] border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-5 sm:p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-400" />
                <span>Novo Chamado / Ocorrência</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Seleção de Categoria com Cards Clicáveis Amplos */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Selecione a Categoria *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = categoria === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoria(cat.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? cat.activeColor
                            : 'bg-slate-950/80 border-slate-700/80 hover:border-slate-600 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-black">{cat.label}</h5>
                          <p className={`text-[10px] sm:text-[11px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                            {cat.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Título */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-200">
                  Título do Relato *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  placeholder="Ex: Lâmpada do hall queimada, vazamento..."
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-200">
                  Descrição dos Detalhes *
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                  rows={3}
                  placeholder="Descreva detalhadamente o ocorrido para o síndico..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 min-h-[48px] px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[48px] bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Chamado</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

