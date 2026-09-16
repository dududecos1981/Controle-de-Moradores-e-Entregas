'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Plus,
  Filter,
  ArrowUpRight,
  Truck,
  Building,
  QrCode,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Encomenda, StatusEntrega } from '@/lib/types';
import { INITIAL_ENCOMENDAS, INITIAL_VISITANTES } from '@/lib/store';
import PackageWithdrawalModal from '@/components/PackageWithdrawalModal';

export default function DashboardPage() {
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | StatusEntrega>('TODOS');
  const [selectedEncomendaForWithdrawal, setSelectedEncomendaForWithdrawal] = useState<Encomenda | null>(null);

  // Inicializa dados com persistência local
  useEffect(() => {
    const saved = localStorage.getItem('portaria_encomendas');
    if (saved) {
      try {
        setEncomendas(JSON.parse(saved));
      } catch (e) {
        setEncomendas(INITIAL_ENCOMENDAS);
      }
    } else {
      setEncomendas(INITIAL_ENCOMENDAS);
      localStorage.setItem('portaria_encomendas', JSON.stringify(INITIAL_ENCOMENDAS));
    }
  }, []);

  const saveEncomendas = (updated: Encomenda[]) => {
    setEncomendas(updated);
    localStorage.setItem('portaria_encomendas', JSON.stringify(updated));
  };

  // Métricas em Tempo Real
  const totalPacotes = encomendas.length;
  const aguardandoRetirada = encomendas.filter((e) => e.status === 'AGUARDANDO_RETIRADA').length;
  const entreguesHoje = encomendas.filter((e) => e.status === 'RETIRADO').length;
  const visitantesAtivos = INITIAL_VISITANTES.filter((v) => v.status_acesso === 'DENTRO').length;

  // Filtragem
  const filteredEncomendas = encomendas.filter((item) => {
    const matchesSearch =
      item.morador_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo_barras_qrcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.transportadora.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${item.unidade_bloco} ${item.unidade_numero}`.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'TODOS' ? true : item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Confirmação de baixa
  const handleConfirmWithdrawal = (id: string, retiradoPorNome: string, retiradoPorDoc: string) => {
    const updated = encomendas.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: 'RETIRADO' as StatusEntrega,
          data_retirada: new Date().toISOString(),
          retirado_por_nome: retiradoPorNome,
          retirado_por_documento: retiradoPorDoc,
        };
      }
      return item;
    });
    saveEncomendas(updated);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Dashboard da Portaria
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-0.5 rounded-full">
              Operação Ao Vivo
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Visão geral de encomendas pendentes, fluxo de entregas e circulação de pessoas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/visitantes"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all shadow-md active:scale-95"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            + Visitante
          </Link>
          <Link
            href="/encomendas"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Registrar Encomenda
          </Link>
        </div>
      </div>

      {/* Cards de Métricas em Tempo Real */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Aguardando Retirada */}
        <div className="bg-[#111827] border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Aguardando Retirada
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{aguardandoRetirada}</span>
            <span className="text-xs text-slate-400 font-medium">pacotes na portaria</span>
          </div>
        </div>

        {/* Card 2: Entregues Hoje */}
        <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Entregues / Baixadas
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{entreguesHoje}</span>
            <span className="text-xs text-slate-400 font-medium">entregas concluídas</span>
          </div>
        </div>

        {/* Card 3: Total Registrado */}
        <div className="bg-[#111827] border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Total Encomendas
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalPacotes}</span>
            <span className="text-xs text-slate-400 font-medium">no histórico</span>
          </div>
        </div>

        {/* Card 4: Visitantes no Condomínio */}
        <div className="bg-[#111827] border border-cyan-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Visitantes no Local
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{visitantesAtivos}</span>
            <span className="text-xs text-slate-400 font-medium">pessoas autorizadas</span>
          </div>
        </div>
      </div>

      {/* Filtros e Busca Rápida */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Campo de Busca */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por morador, código, bloco ou transportadora..."
            className="w-full bg-slate-950 text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Abas de Status */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('TODOS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'TODOS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Todos ({totalPacotes})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('AGUARDANDO_RETIRADA')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'AGUARDANDO_RETIRADA'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Aguardando ({aguardandoRetirada})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('RETIRADO')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'RETIRADO'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Entregues ({entreguesHoje})
          </button>
        </div>
      </div>

      {/* Tabela de Encomendas em Tempo Real */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Controle de Encomendas da Portaria</h3>
          </div>
          <span className="text-xs text-slate-400">
            Mostrando {filteredEncomendas.length} de {totalPacotes} encomendas
          </span>
        </div>

        {filteredEncomendas.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-semibold text-slate-300">Nenhuma encomenda encontrada</p>
            <p className="text-xs text-slate-500 mt-1">Ajuste os filtros ou registre um novo pacote no leitor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Unidade / Morador</th>
                  <th className="py-3 px-4">Código / QR Code</th>
                  <th className="py-3 px-4">Transportadora</th>
                  <th className="py-3 px-4">Data Recebimento</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredEncomendas.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Unidade e Morador */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs shrink-0">
                          {item.unidade_bloco}-{item.unidade_numero}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{item.morador_nome}</p>
                          <p className="text-[11px] text-slate-400">Bloco {item.unidade_bloco}, Apto {item.unidade_numero}</p>
                        </div>
                      </div>
                    </td>

                    {/* Código / Rastreio */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                        {item.codigo_barras_qrcode}
                      </span>
                    </td>

                    {/* Transportadora */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.transportadora}</span>
                      </div>
                    </td>

                    {/* Data Recebimento */}
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(item.data_recebimento).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(item.data_recebimento).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {item.status === 'AGUARDANDO_RETIRADA' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Aguardando Retirada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Entregue
                        </span>
                      )}
                    </td>

                    {/* Ação */}
                    <td className="py-3.5 px-4 text-right">
                      {item.status === 'AGUARDANDO_RETIRADA' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedEncomendaForWithdrawal(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Dar Baixa
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          Retirado por {item.retirado_por_nome || 'Morador'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Baixa de Encomenda */}
      <PackageWithdrawalModal
        encomenda={selectedEncomendaForWithdrawal}
        isOpen={!!selectedEncomendaForWithdrawal}
        onClose={() => setSelectedEncomendaForWithdrawal(null)}
        onConfirmWithdrawal={handleConfirmWithdrawal}
      />
    </div>
  );
}
