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
  UserPlus,
  HardHat,
  LogIn,
  LogOut,
  Car,
  Activity,
  ShieldCheck,
  Radio,
  Eye,
  Camera,
  X,
  Check,
  Upload,
} from 'lucide-react';
import { Encomenda, StatusEntrega, RegistroAcesso, TipoPessoaAcesso } from '@/lib/types';
import { INITIAL_ENCOMENDAS, INITIAL_VISITANTES, INITIAL_PRESTADORES, INITIAL_ACESSOS, INITIAL_MORADORES } from '@/lib/store';
import PackageWithdrawalModal from '@/components/PackageWithdrawalModal';
import WebcamCapture from '@/components/WebcamCapture';
import SoundEffects from '@/lib/SoundEffects';

export default function DashboardPage() {
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [acessos, setAcessos] = useState<RegistroAcesso[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | StatusEntrega>('TODOS');
  const [acessoFilter, setAcessoFilter] = useState<'TODOS' | TipoPessoaAcesso>('TODOS');
  const [selectedEncomendaForWithdrawal, setSelectedEncomendaForWithdrawal] = useState<Encomenda | null>(null);

  // Modal de Registro Rápido de Acesso
  const [isQuickAccessModalOpen, setIsQuickAccessModalOpen] = useState(false);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [quickAccessData, setQuickAccessData] = useState({
    tipo_pessoa: 'MORADOR' as TipoPessoaAcesso,
    nome: '',
    tipo_movimentacao: 'ENTRADA' as 'ENTRADA' | 'SAIDA',
    unidade_bloco: 'A',
    unidade_numero: '101',
    metodo_validacao: 'BIOMETRIA_FACIAL' as const,
    veiculo_placa: '',
    empresa: '',
    foto_url: '',
    observacoes: '',
  });

  // Inicializa dados com persistência local
  useEffect(() => {
    // Limpeza automática de dados fictícios legados
    const isCleaned = localStorage.getItem('portaria_data_cleaned_v2');
    if (!isCleaned) {
      localStorage.removeItem('portaria_encomendas');
      localStorage.removeItem('portaria_acessos');
      localStorage.removeItem('portaria_visitantes');
      localStorage.removeItem('portaria_prestadores');
      localStorage.removeItem('portaria_moradores');
      localStorage.removeItem('portaria_comunicados');
      localStorage.setItem('portaria_data_cleaned_v2', 'true');
    }

    // Encomendas
    const savedEnc = localStorage.getItem('portaria_encomendas');
    if (savedEnc) {
      try {
        setEncomendas(JSON.parse(savedEnc));
      } catch (e) {
        setEncomendas([]);
      }
    } else {
      setEncomendas([]);
    }

    // Acessos
    const savedAcessos = localStorage.getItem('portaria_acessos');
    if (savedAcessos) {
      try {
        setAcessos(JSON.parse(savedAcessos));
      } catch (e) {
        setAcessos([]);
      }
    } else {
      setAcessos([]);
    }
  }, []);

  const saveEncomendas = (updated: Encomenda[]) => {
    setEncomendas(updated);
    localStorage.setItem('portaria_encomendas', JSON.stringify(updated));
  };

  const saveAcessos = (updated: RegistroAcesso[]) => {
    setAcessos(updated);
    localStorage.setItem('portaria_acessos', JSON.stringify(updated));
  };

  // Métricas em Tempo Real
  const totalPacotes = encomendas.length;
  const aguardandoRetirada = encomendas.filter((e) => e.status === 'AGUARDANDO_RETIRADA').length;
  const entreguesHoje = encomendas.filter((e) => e.status === 'RETIRADO').length;
  
  // Visitantes & Prestadores Presentes no Condomínio
  const savedVisitantes = typeof window !== 'undefined' ? localStorage.getItem('portaria_visitantes') : null;
  const listVisitantes = savedVisitantes ? JSON.parse(savedVisitantes) : [];
  const visitantesDentro = listVisitantes.filter((v: any) => v.status_acesso === 'DENTRO').length;

  const savedPrestadores = typeof window !== 'undefined' ? localStorage.getItem('portaria_prestadores') : null;
  const listPrestadores = savedPrestadores ? JSON.parse(savedPrestadores) : [];
  const prestadoresDentro = listPrestadores.filter((p: any) => p.status_acesso === 'DENTRO').length;

  const totalPessoasPresentes = visitantesDentro + prestadoresDentro;

  // Filtragem de Encomendas
  const filteredEncomendas = encomendas.filter((item) => {
    const matchesSearch =
      item.morador_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo_barras_qrcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.transportadora.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${item.unidade_bloco} ${item.unidade_numero}`.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'TODOS' ? true : item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filtragem de Acessos Recentes
  const filteredAcessos = acessos.filter((ac) => {
    if (acessoFilter === 'TODOS') return true;
    return ac.tipo_pessoa === acessoFilter;
  });

  // Confirmação de baixa de pacote
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
    SoundEffects.playSuccess();
  };

  // Registrar Acesso Rápido
  const handleSaveQuickAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAccessData.nome.trim()) {
      alert('Informe o nome da pessoa.');
      return;
    }

    const novoAcesso: RegistroAcesso = {
      id: `ac-${Date.now()}`,
      tipo_pessoa: quickAccessData.tipo_pessoa,
      nome: quickAccessData.nome.trim(),
      unidade_bloco: quickAccessData.unidade_bloco,
      unidade_numero: quickAccessData.unidade_numero,
      tipo_movimentacao: quickAccessData.tipo_movimentacao,
      data_hora: new Date().toISOString(),
      metodo_validacao: quickAccessData.metodo_validacao,
      veiculo_placa: quickAccessData.veiculo_placa ? quickAccessData.veiculo_placa.toUpperCase().trim() : undefined,
      empresa: quickAccessData.empresa ? quickAccessData.empresa.trim() : undefined,
      foto_url: quickAccessData.foto_url || undefined,
      porteiro_responsavel: 'João Portaria',
      observacoes: quickAccessData.observacoes ? quickAccessData.observacoes.trim() : undefined,
    };

    const updated = [novoAcesso, ...acessos];
    saveAcessos(updated);
    SoundEffects.playSuccess();

    setIsQuickAccessModalOpen(false);
    setQuickAccessData({
      tipo_pessoa: 'MORADOR',
      nome: '',
      tipo_movimentacao: 'ENTRADA',
      unidade_bloco: 'A',
      unidade_numero: '101',
      metodo_validacao: 'BIOMETRIA_FACIAL',
      veiculo_placa: '',
      empresa: '',
      foto_url: '',
      observacoes: '',
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Dashboard da Portaria
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Operação Ao Vivo
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Controle de acessos de moradores, visitantes, prestadores de serviço e encomendas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/prestadores"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-bold rounded-xl border border-amber-800/40 transition-all shadow-md active:scale-95"
          >
            <HardHat className="w-4 h-4 text-amber-400" />
            Prestadores de Serviço
          </Link>
          <Link
            href="/moradores"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all shadow-md active:scale-95"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            Moradores
          </Link>
          <Link
            href="/visitantes"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all shadow-md active:scale-95"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            Visitantes
          </Link>
          <button
            onClick={() => setIsQuickAccessModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
          >
            <Radio className="w-4 h-4" />
            + Registrar Acesso
          </button>
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
              Encomendas Pendentes
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{aguardandoRetirada}</span>
            <span className="text-xs text-slate-400 font-medium">aguardando retirada</span>
          </div>
        </div>

        {/* Card 2: Entregues Hoje */}
        <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Entregas Realizadas
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{entreguesHoje}</span>
            <span className="text-xs text-slate-400 font-medium">pacotes entregues</span>
          </div>
        </div>

        {/* Card 3: Prestadores no Local */}
        <div className="bg-[#111827] border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <HardHat className="w-4 h-4" />
              Prestadores no Prédio
            </span>
            <Link
              href="/prestadores"
              className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
            >
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{prestadoresDentro}</span>
            <span className="text-xs text-slate-400 font-medium">técnicos em obras/serviços</span>
          </div>
        </div>

        {/* Card 4: Visitantes no Condomínio */}
        <div className="bg-[#111827] border border-cyan-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Visitantes Presentes
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{visitantesDentro}</span>
            <span className="text-xs text-slate-400 font-medium">pessoas autorizadas</span>
          </div>
        </div>
      </div>

      {/* SEÇÃO 1: FEED DE ÚLTIMOS ACESSOS AO VIVO */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Últimos Acessos da Portaria
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  Tempo Real
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Fluxo contínuo de entradas e saídas de Moradores, Visitantes e Prestadores de Serviço.
              </p>
            </div>
          </div>

          {/* Filtros por Categoria de Pessoa */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setAcessoFilter('TODOS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                acessoFilter === 'TODOS'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Todos ({acessos.length})
            </button>
            <button
              onClick={() => setAcessoFilter('MORADOR')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                acessoFilter === 'MORADOR'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-cyan-400 hover:bg-cyan-950/40'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Moradores
            </button>
            <button
              onClick={() => setAcessoFilter('VISITANTE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                acessoFilter === 'VISITANTE'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-emerald-400 hover:bg-emerald-950/40'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Visitantes
            </button>
            <button
              onClick={() => setAcessoFilter('PRESTADOR_SERVICO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                acessoFilter === 'PRESTADOR_SERVICO'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              Prestadores
            </button>
          </div>
        </div>

        {/* Lista de Acessos Recentes */}
        <div className="divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto">
          {filteredAcessos.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                {/* Foto ou Avatar */}
                <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-700/80 overflow-hidden flex items-center justify-center shrink-0">
                  {item.foto_url ? (
                    <img src={item.foto_url} alt={item.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white font-bold text-xs">{item.nome.substring(0, 2).toUpperCase()}</div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{item.nome}</h4>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${
                        item.tipo_pessoa === 'MORADOR'
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800/40'
                          : item.tipo_pessoa === 'PRESTADOR_SERVICO'
                          ? 'bg-amber-950 text-amber-300 border-amber-800/40'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800/40'
                      }`}
                    >
                      {item.tipo_pessoa === 'PRESTADOR_SERVICO'
                        ? 'PRESTADOR'
                        : item.tipo_pessoa}
                    </span>
                    {item.empresa && (
                      <span className="text-[10px] text-amber-400 font-medium">({item.empresa})</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300 font-semibold">
                      <Building className="w-3 h-3 text-slate-500" />
                      Bloco {item.unidade_bloco} • Apto {item.unidade_numero}
                    </span>

                    {item.veiculo_placa && (
                      <span className="flex items-center gap-1 font-mono text-slate-300">
                        <Car className="w-3 h-3 text-cyan-400" />
                        {item.veiculo_placa} {item.veiculo_modelo ? `(${item.veiculo_modelo})` : ''}
                      </span>
                    )}

                    {item.servico_descricao && (
                      <span className="text-slate-400 italic truncate max-w-[200px]">
                        • {item.servico_descricao}
                      </span>
                    )}

                    {item.autorizado_por && (
                      <span className="text-slate-400">
                        • Aut: {item.autorizado_por}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status do Movimento & Horário */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    item.tipo_movimentacao === 'ENTRADA'
                      ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/50'
                      : 'bg-rose-950/70 text-rose-400 border-rose-800/50'
                  }`}
                >
                  {item.tipo_movimentacao === 'ENTRADA' ? (
                    <>
                      <LogIn className="w-3.5 h-3.5" />
                      ENTRADA
                    </>
                  ) : (
                    <>
                      <LogOut className="w-3.5 h-3.5" />
                      SAÍDA
                    </>
                  )}
                </span>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {new Date(item.data_hora).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}

          {filteredAcessos.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs italic">
              Nenhum registro de acesso recente nesta categoria.
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO 2: TABELA DE ENCOMENDAS */}
      <div className="space-y-4">
        {/* Filtros e Busca Rápida de Encomendas */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por morador, código de barras, bloco ou transportadora..."
              className="w-full bg-slate-950 text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

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
              Todas Encomendas ({totalPacotes})
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

        {/* Tabela de Encomendas */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Controle de Encomendas & Pacotes</h3>
            </div>
            <Link
              href="/encomendas"
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Abrir Scanner / Leitor de Pacotes <ChevronRight className="w-3.5 h-3.5" />
            </Link>
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
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
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
      </div>

      {/* MODAL: Registro Rápido de Acesso */}
      {isQuickAccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Registrar Entrada / Saída Rápida</h3>
                  <p className="text-[11px] text-slate-400">Insira a movimentação na portaria.</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickAccessModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickAccess} className="space-y-4 pt-4">
              {/* Tipo de Pessoa */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Categoria da Pessoa</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickAccessData({ ...quickAccessData, tipo_pessoa: 'MORADOR' })}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      quickAccessData.tipo_pessoa === 'MORADOR'
                        ? 'bg-cyan-600 text-white border-cyan-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Morador
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAccessData({ ...quickAccessData, tipo_pessoa: 'VISITANTE' })}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      quickAccessData.tipo_pessoa === 'VISITANTE'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Visitante
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAccessData({ ...quickAccessData, tipo_pessoa: 'PRESTADOR_SERVICO' })}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      quickAccessData.tipo_pessoa === 'PRESTADOR_SERVICO'
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Prestador
                  </button>
                </div>
              </div>

              {/* Movimentação */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQuickAccessData({ ...quickAccessData, tipo_movimentacao: 'ENTRADA' })}
                  className={`py-2 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl border transition-all ${
                    quickAccessData.tipo_movimentacao === 'ENTRADA'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  ENTRADA
                </button>
                <button
                  type="button"
                  onClick={() => setQuickAccessData({ ...quickAccessData, tipo_movimentacao: 'SAIDA' })}
                  className={`py-2 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl border transition-all ${
                    quickAccessData.tipo_movimentacao === 'SAIDA'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  SAÍDA
                </button>
              </div>

              {/* Nome */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo / Mariana Fernandes"
                  value={quickAccessData.nome}
                  onChange={(e) => setQuickAccessData({ ...quickAccessData, nome: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Empresa (se for prestador) */}
              {quickAccessData.tipo_pessoa === 'PRESTADOR_SERVICO' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Empresa Prestadora</label>
                  <input
                    type="text"
                    placeholder="Ex: EletroFix / Claro / Enel"
                    value={quickAccessData.empresa}
                    onChange={(e) => setQuickAccessData({ ...quickAccessData, empresa: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Unidade */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Bloco / Torre</label>
                  <input
                    type="text"
                    list="dashboard-blocos-list"
                    placeholder="Ex: Bloco A, Torre 1"
                    value={quickAccessData.unidade_bloco}
                    onChange={(e) => setQuickAccessData({ ...quickAccessData, unidade_bloco: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  <datalist id="dashboard-blocos-list">
                    <option value="Bloco A" />
                    <option value="Bloco B" />
                    <option value="Bloco C" />
                    <option value="Bloco D" />
                    <option value="Torre 1" />
                    <option value="Torre 2" />
                    <option value="Quadra 1" />
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Apto / Unidade</label>
                  <input
                    type="text"
                    placeholder="Ex: 101, PH01"
                    value={quickAccessData.unidade_numero}
                    onChange={(e) => setQuickAccessData({ ...quickAccessData, unidade_numero: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              {/* Foto Biométrica / Identificação Facial */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {quickAccessData.foto_url ? (
                    <img src={quickAccessData.foto_url} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    Foto de Validação (Opcional)
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsWebcamOpen(true)}
                      className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Camera className="w-3 h-3" />
                      {quickAccessData.foto_url ? 'Recapturar Foto' : 'Tirar Foto Webcam'}
                    </button>
                    {quickAccessData.foto_url && (
                      <button
                        type="button"
                        onClick={() => setQuickAccessData({ ...quickAccessData, foto_url: '' })}
                        className="text-[11px] text-rose-400 hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Placa do Veículo (Opcional) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Placa do Veículo (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: ABC1D23"
                  value={quickAccessData.veiculo_placa}
                  onChange={(e) => setQuickAccessData({ ...quickAccessData, veiculo_placa: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 uppercase font-mono"
                />
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickAccessModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25"
                >
                  Confirmar Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Webcam no Dashboard */}
      {isWebcamOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 max-w-lg w-full relative shadow-2xl">
            <button
              type="button"
              onClick={() => setIsWebcamOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              Captura Biométrica / Foto da Portaria
            </h3>
            <WebcamCapture
              onPhotoCaptured={(dataUrl) => {
                setQuickAccessData({ ...quickAccessData, foto_url: dataUrl });
                setIsWebcamOpen(false);
              }}
              currentPhotoUrl={quickAccessData.foto_url}
            />
          </div>
        </div>
      )}

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
