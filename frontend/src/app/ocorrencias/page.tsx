'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  Building,
  User,
  MessageSquare,
  Wrench,
  Volume2,
  ShieldAlert,
  Sparkles,
  X,
  Eye,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { Ocorrencia, CategoriaOcorrencia, StatusOcorrencia } from '@/lib/types';
import { api } from '@/lib/api';
import { sounds } from '@/lib/SoundEffects';

const INITIAL_OCORRENCIAS: Ocorrencia[] = [];

export default function OcorrenciasPage() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [categoriaFilter, setCategoriaFilter] = useState('TODOS');
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
  const [isRespostaModalOpen, setIsRespostaModalOpen] = useState(false);
  const [respostaText, setRespostaText] = useState('');
  const [novoStatus, setNovoStatus] = useState<StatusOcorrencia>('RESOLVIDO');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('portaria_ocorrencias');
    if (saved) {
      try {
        setOcorrencias(JSON.parse(saved));
      } catch (e) {
        setOcorrencias(INITIAL_OCORRENCIAS);
      }
    } else {
      setOcorrencias(INITIAL_OCORRENCIAS);
      localStorage.setItem('portaria_ocorrencias', JSON.stringify(INITIAL_OCORRENCIAS));
    }
  }, []);

  const saveOcorrencias = (updated: Ocorrencia[]) => {
    setOcorrencias(updated);
    localStorage.setItem('portaria_ocorrencias', JSON.stringify(updated));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenResponderModal = (oc: Ocorrencia) => {
    setSelectedOcorrencia(oc);
    setRespostaText(oc.resposta_sindico || '');
    setNovoStatus(oc.status === 'ABERTO' ? 'EM_ANDAMENTO' : oc.status);
    setIsRespostaModalOpen(true);
  };

  const handleSaveResposta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOcorrencia || !respostaText.trim()) return;

    const updated = ocorrencias.map((oc) => {
      if (oc.id === selectedOcorrencia.id) {
        return {
          ...oc,
          resposta_sindico: respostaText.trim(),
          status: novoStatus,
          respondido_por_nome: 'Administração / Síndico',
          respondido_em: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return oc;
    });

    saveOcorrencias(updated);
    sounds.playSuccessChime();
    showToast(`Ocorrência #${selectedOcorrencia.id.slice(0, 8)} respondida com sucesso!`);
    setIsRespostaModalOpen(false);
  };

  const filteredOcorrencias = ocorrencias.filter((oc) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      oc.titulo.toLowerCase().includes(term) ||
      oc.descricao.toLowerCase().includes(term) ||
      oc.solicitante_nome.toLowerCase().includes(term) ||
      `${oc.unidade_bloco} ${oc.unidade_numero}`.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'TODOS' || oc.status === statusFilter;
    const matchesCategoria = categoriaFilter === 'TODOS' || oc.categoria === categoriaFilter;

    return matchesSearch && matchesStatus && matchesCategoria;
  });

  const totalAbertas = ocorrencias.filter((oc) => oc.status === 'ABERTO').length;
  const totalEmAndamento = ocorrencias.filter((oc) => oc.status === 'EM_ANDAMENTO').length;
  const totalResolvidas = ocorrencias.filter((oc) => oc.status === 'RESOLVIDO').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <AlertCircle className="w-7 h-7 text-amber-400" />
            Livro de Ocorrências & Manutenção
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestão de chamados, relatos de barulho, manutenções e pareceres do síndico
          </p>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#121a2f] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-slate-400 font-medium">Total de Chamados</p>
          <p className="text-xl font-black text-white mt-0.5">{ocorrencias.length}</p>
        </div>
        <div className="bg-[#121a2f] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-slate-400 font-medium">Novos / Abertos</p>
          <p className="text-xl font-black text-rose-400 mt-0.5">{totalAbertas}</p>
        </div>
        <div className="bg-[#121a2f] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-slate-400 font-medium">Em Andamento</p>
          <p className="text-xl font-black text-amber-400 mt-0.5">{totalEmAndamento}</p>
        </div>
        <div className="bg-[#121a2f] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-slate-400 font-medium">Resolvidos</p>
          <p className="text-xl font-black text-emerald-400 mt-0.5">{totalResolvidas}</p>
        </div>
      </div>

      {/* Barra de Busca & Filtros */}
      <div className="bg-[#121a2f] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar chamado por título, morador ou unidade..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="ABERTO">Abertos</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="RESOLVIDO">Resolvidos</option>
          </select>

          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="TODOS">Todas as Categorias</option>
            <option value="MANUTENCAO">Manutenção</option>
            <option value="BARULHO">Barulho</option>
            <option value="GARAGEM">Garagem</option>
            <option value="SEGURANCA">Segurança</option>
            <option value="LIMPEZA">Limpeza</option>
            <option value="CONVIVENCIA">Convivência</option>
          </select>
        </div>
      </div>

      {/* Lista de Ocorrências */}
      <div className="space-y-4">
        {filteredOcorrencias.map((oc) => (
          <div
            key={oc.id}
            className="bg-[#121a2f] border border-slate-800/90 hover:border-slate-700 rounded-3xl p-6 shadow-xl space-y-4 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    oc.categoria === 'MANUTENCAO'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : oc.categoria === 'BARULHO'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {oc.categoria === 'MANUTENCAO' ? (
                    <Wrench className="w-5 h-5" />
                  ) : oc.categoria === 'BARULHO' ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{oc.titulo}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                      {oc.categoria}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Aberto por <strong className="text-slate-200">{oc.solicitante_nome}</strong> (Bloco {oc.unidade_bloco} - Apto {oc.unidade_numero}) em {new Date(oc.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold font-mono px-3 py-1 rounded-full border ${
                    oc.status === 'RESOLVIDO'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : oc.status === 'EM_ANDAMENTO'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {oc.status}
                </span>

                <button
                  onClick={() => handleOpenResponderModal(oc)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all"
                >
                  Responder / Alterar Status
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-300 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              {oc.descricao}
            </p>

            {oc.foto_url && (
              <div className="flex items-center gap-3">
                <a
                  href={oc.foto_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl hover:bg-indigo-500/20 transition-all"
                >
                  <ImageIcon className="w-4 h-4" /> Ver Foto Anexada
                </a>
              </div>
            )}

            {oc.resposta_sindico && (
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" /> Parecer da Administração ({oc.respondido_por_nome || 'Síndico'})
                  </span>
                  {oc.respondido_em && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(oc.respondido_em).toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-200">{oc.resposta_sindico}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Resposta da Administração */}
      {isRespostaModalOpen && selectedOcorrencia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121a2f] border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Parecer do Síndico / Gestão
              </h3>
              <button onClick={() => setIsRespostaModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResposta} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Status do Chamado
                </label>
                <select
                  value={novoStatus}
                  onChange={(e) => setNovoStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="EM_ANDAMENTO">EM_ANDAMENTO (Em atendimento)</option>
                  <option value="RESOLVIDO">RESOLVIDO (Concluído)</option>
                  <option value="CANCELADO">CANCELADO (Indevido / Cancelado)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Parecer / Resposta ao Morador *
                </label>
                <textarea
                  value={respostaText}
                  onChange={(e) => setRespostaText(e.target.value)}
                  required
                  rows={4}
                  placeholder="Descreva as medidas tomadas, agendamento de técnico ou orientações..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRespostaModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20"
                >
                  Salvar e Notificar Morador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
