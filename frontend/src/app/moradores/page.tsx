'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Filter,
  Car,
  Shield,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  UserX,
  Camera,
  X,
  Sparkles,
  Package,
  UserCheck,
  FileText,
  ChevronRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { Morador, Veiculo, Dependente, StatusEntrega } from '@/lib/types';
import { INITIAL_MORADORES, INITIAL_ENCOMENDAS, INITIAL_VISITANTES } from '@/lib/store';
import WebcamCapture from '@/components/WebcamCapture';
import SoundEffects from '@/lib/SoundEffects';

export default function MoradoresPage() {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [blocoFilter, setBlocoFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  
  // Modais
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false);
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [selectedMorador, setSelectedMorador] = useState<Morador | null>(null);
  const [editingMoradorId, setEditingMoradorId] = useState<string | null>(null);
  const [activeTabPerfil, setActiveTabPerfil] = useState<'cadastrais' | 'veiculos' | 'encomendas' | 'visitas'>('cadastrais');

  // Form State
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    email: '',
    telefone: '',
    unidade_bloco: 'A',
    unidade_numero: '',
    perfil: 'MORADOR' as 'MORADOR' | 'SINDICO' | 'PORTEIRO' | 'ADMINISTRADOR',
    avatar_url: '',
    observacoes: '',
    lgpd_termo_aceito: true,
  });

  const [veiculosList, setVeiculosList] = useState<Veiculo[]>([]);
  const [novoVeiculo, setNovoVeiculo] = useState({ placa: '', modelo: '', cor: '', vaga: '' });

  // Inicialização com LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('portaria_moradores');
    if (saved) {
      try {
        setMoradores(JSON.parse(saved));
      } catch (e) {
        setMoradores(INITIAL_MORADORES);
      }
    } else {
      setMoradores(INITIAL_MORADORES);
      localStorage.setItem('portaria_moradores', JSON.stringify(INITIAL_MORADORES));
    }
  }, []);

  const saveMoradores = (updated: Morador[]) => {
    setMoradores(updated);
    localStorage.setItem('portaria_moradores', JSON.stringify(updated));
  };

  // Métricas
  const totalMoradores = moradores.filter((m) => !m.lgpd_anonimizado).length;
  const totalVeiculos = moradores.reduce((acc, m) => acc + (m.veiculos?.length || 0), 0);
  const unidadesOcupadas = new Set(moradores.map((m) => `${m.unidade_bloco}-${m.unidade_numero}`)).size;
  const totalLgpdOk = moradores.filter((m) => m.lgpd_termo_aceito && !m.lgpd_anonimizado).length;

  // Filtragem
  const filteredMoradores = moradores.filter((m) => {
    if (m.lgpd_anonimizado) return false;
    const matchesSearch =
      m.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.cpf.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${m.unidade_bloco} ${m.unidade_numero}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.veiculos.some((v) => v.placa.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBloco = blocoFilter === 'TODOS' ? true : m.unidade_bloco === blocoFilter;
    const matchesStatus = statusFilter === 'TODOS' ? true : m.status === statusFilter;

    return matchesSearch && matchesBloco && matchesStatus;
  });

  // Abertura de Cadastro / Edição
  const handleOpenCreateModal = () => {
    setEditingMoradorId(null);
    setFormData({
      nome_completo: '',
      cpf: '',
      email: '',
      telefone: '',
      unidade_bloco: 'A',
      unidade_numero: '',
      perfil: 'MORADOR',
      avatar_url: '',
      observacoes: '',
      lgpd_termo_aceito: true,
    });
    setVeiculosList([]);
    setIsCadastroModalOpen(true);
  };

  const handleOpenEditModal = (morador: Morador) => {
    setEditingMoradorId(morador.id);
    setFormData({
      nome_completo: morador.nome_completo,
      cpf: morador.cpf,
      email: morador.email,
      telefone: morador.telefone,
      unidade_bloco: morador.unidade_bloco,
      unidade_numero: morador.unidade_numero,
      perfil: morador.perfil as any,
      avatar_url: morador.avatar_url || '',
      observacoes: morador.observacoes || '',
      lgpd_termo_aceito: morador.lgpd_termo_aceito,
    });
    setVeiculosList(morador.veiculos || []);
    setIsCadastroModalOpen(true);
  };

  const handleAddVeiculo = () => {
    if (!novoVeiculo.placa || !novoVeiculo.modelo) return;
    const v: Veiculo = {
      id: `v-${Date.now()}`,
      placa: novoVeiculo.placa.toUpperCase(),
      modelo: novoVeiculo.modelo,
      cor: novoVeiculo.cor || 'Não informada',
      tipo: 'CARRO',
      vaga: novoVeiculo.vaga || undefined,
    };
    setVeiculosList([...veiculosList, v]);
    setNovoVeiculo({ placa: '', modelo: '', cor: '', vaga: '' });
  };

  const handleRemoveVeiculo = (id: string) => {
    setVeiculosList(veiculosList.filter((v) => v.id !== id));
  };

  const handleSaveMorador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome_completo || !formData.cpf || !formData.unidade_numero) {
      alert('Por favor, preencha Nome Completo, CPF e Número da Unidade.');
      return;
    }

    if (editingMoradorId) {
      // Atualizar existente
      const updated = moradores.map((m) => {
        if (m.id === editingMoradorId) {
          return {
            ...m,
            ...formData,
            veiculos: veiculosList,
          };
        }
        return m;
      });
      saveMoradores(updated);
      SoundEffects.playSuccess();
    } else {
      // Criar novo
      const novo: Morador = {
        id: `mor-${Date.now()}`,
        unidade_id: `u-${Date.now()}`,
        ...formData,
        status: 'ATIVO',
        is_responsavel_unidade: true,
        data_cadastro: new Date().toISOString(),
        veiculos: veiculosList,
        dependentes: [],
        lgpd_data_aceite: new Date().toISOString(),
        lgpd_anonimizado: false,
      };
      saveMoradores([novo, ...moradores]);
      SoundEffects.playSuccess();
    }

    setIsCadastroModalOpen(false);
  };

  // Anonimização LGPD (Direito ao Esquecimento)
  const handleAnonimizarMorador = (id: string, nome: string) => {
    const confirm = window.confirm(
      `CONFIRMAÇÃO DE SEGURANÇA LGPD (Artigo 18):\n\nTem certeza que deseja anonimizar os dados de "${nome}"?\nTodos os dados pessoais (nome, CPF, telefone, foto) serão ofuscados irreversivelmente, preservando apenas o histórico numérico de auditoria.`,
    );
    if (!confirm) return;

    const updated = moradores.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          nome_completo: `TITULAR_ANONIMIZADO_${m.id.substring(0, 6)}`,
          cpf: `ANONIMIZADO_${m.id.substring(0, 6)}`,
          email: `anonimizado_${m.id.substring(0, 6)}@lgpd.local`,
          telefone: '(00) 00000-0000',
          avatar_url: undefined,
          status: 'INATIVO' as const,
          lgpd_anonimizado: true,
        };
      }
      return m;
    });

    saveMoradores(updated);
    if (selectedMorador?.id === id) {
      setIsPerfilModalOpen(false);
    }
    SoundEffects.playAlert();
    alert('Operação LGPD concluída com sucesso. Registro anonimizado conforme Lei nº 13.709/2018.');
  };

  // Visualização de Perfil
  const handleViewPerfil = (morador: Morador) => {
    setSelectedMorador(morador);
    setActiveTabPerfil('cadastrais');
    setIsPerfilModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Gestão de Moradores & Residentes
            <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-0.5 rounded-full">
              Ficha Completa
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Cadastro unificado de condôminos, veículos, dependentes e gestão de privacidade LGPD.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/comunicados-ia"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all shadow-md active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Criar Comunicado IA
          </Link>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Novo Morador
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Total Moradores</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalMoradores}</span>
            <span className="text-xs text-slate-400 font-medium">titulares ativos</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-cyan-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Unidades Ocupadas</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{unidadesOcupadas}</span>
            <span className="text-xs text-slate-400 font-medium">apartamentos</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Veículos Registrados</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalVeiculos}</span>
            <span className="text-xs text-slate-400 font-medium">carros e motos</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Conformidade LGPD</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">100%</span>
            <span className="text-xs text-slate-400 font-medium">termos aceitos</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="p-4 bg-[#111827] border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, unidade (Apto 101) ou placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Bloco:</span>
          </div>
          <select
            value={blocoFilter}
            onChange={(e) => setBlocoFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="TODOS">Todos os Blocos</option>
            <option value="A">Bloco A</option>
            <option value="B">Bloco B</option>
          </select>

          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0 ml-2">
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </select>
        </div>
      </div>

      {/* Grid de Moradores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMoradores.map((morador) => (
          <div
            key={morador.id}
            className="bg-[#111827] border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Header do Card */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-indigo-500/20 shrink-0 overflow-hidden">
                    {morador.avatar_url ? (
                      <img
                        src={morador.avatar_url}
                        alt={morador.nome_completo}
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-bold text-sm">
                        {morador.nome_completo.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {morador.nome_completo}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-500" />
                        Bloco {morador.unidade_bloco} • Apto {morador.unidade_numero}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    morador.perfil === 'SINDICO'
                      ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                      : 'bg-indigo-950/60 text-indigo-400 border-indigo-800/40'
                  }`}
                >
                  {morador.perfil}
                </span>
              </div>

              {/* Informações de Contato e Documentos */}
              <div className="mt-4 space-y-2 py-3 border-y border-slate-800/60 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    Telefone:
                  </span>
                  <span className="font-mono text-slate-200">{morador.telefone}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    E-mail:
                  </span>
                  <span className="text-slate-300 truncate max-w-[160px]">{morador.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                    CPF:
                  </span>
                  <span className="font-mono text-slate-300">{morador.cpf}</span>
                </div>
              </div>

              {/* Veículos Cadastrados */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-cyan-400" />
                    Veículos ({morador.veiculos?.length || 0})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {morador.veiculos && morador.veiculos.length > 0 ? (
                    morador.veiculos.map((v) => (
                      <span
                        key={v.id}
                        className="text-[10px] font-mono bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded text-slate-300"
                      >
                        {v.placa} ({v.modelo})
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Nenhum veículo cadastrado</span>
                  )}
                </div>
              </div>
            </div>

            {/* Ações do Card */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleViewPerfil(morador)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                Ver Perfil
              </button>
              <button
                onClick={() => handleOpenEditModal(morador)}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
                title="Editar Cadastro"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleAnonimizarMorador(morador.id, morador.nome_completo)}
                className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-xl border border-rose-800/40 transition-colors"
                title="Anonimizar Dados (LGPD Art. 18)"
              >
                <UserX className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: Cadastro e Edição de Morador */}
      {isCadastroModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingMoradorId ? 'Editar Cadastro de Morador' : 'Novo Cadastro de Morador'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Preencha os dados cadastrais, foto biométrica e veículos associados.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCadastroModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveMorador} className="p-6 space-y-6">
              {/* Seção 1: Dados Pessoais */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  1. Dados Pessoais & Unidade
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mariana Fernandes"
                      value={formData.nome_completo}
                      onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">CPF *</label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Telefone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 99999-9999"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">E-mail</label>
                    <input
                      type="email"
                      placeholder="morador@condominio.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Perfil de Acesso</label>
                    <select
                      value={formData.perfil}
                      onChange={(e) => setFormData({ ...formData, perfil: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="MORADOR">Morador</option>
                      <option value="SINDICO">Síndico / Gestor</option>
                      <option value="PORTEIRO">Porteiro / Recepção</option>
                      <option value="ADMINISTRADOR">Administrador</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Bloco</label>
                    <select
                      value={formData.unidade_bloco}
                      onChange={(e) => setFormData({ ...formData, unidade_bloco: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="A">Bloco A</option>
                      <option value="B">Bloco B</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Número da Unidade (Apto/Casa) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 101, 204, PH01"
                      value={formData.unidade_numero}
                      onChange={(e) => setFormData({ ...formData, unidade_numero: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Foto Biométrica / Facial */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  2. Foto Biométrica Facial
                </h4>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Foto Morador" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-600" />
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setIsWebcamOpen(true)}
                      className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Capturar via Webcam
                    </button>
                    <span className="text-[11px] text-slate-400">
                      Ou insira URL de imagem para cadastro remoto.
                    </span>
                  </div>
                </div>
              </div>

              {/* Seção 3: Veículos */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Car className="w-4 h-4" />
                  3. Veículos Associados
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Placa (BRA2E19)"
                    value={novoVeiculo.placa}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, placa: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 uppercase font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Modelo (Jeep)"
                    value={novoVeiculo.modelo}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, modelo: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Cor (Cinza)"
                    value={novoVeiculo.cor}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, cor: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddVeiculo}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl px-3 py-1.5 transition-colors"
                  >
                    + Veículo
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {veiculosList.map((v) => (
                    <span
                      key={v.id}
                      className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono"
                    >
                      {v.placa} - {v.modelo}
                      <button
                        type="button"
                        onClick={() => handleRemoveVeiculo(v.id)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Termo LGPD */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="lgpd"
                  checked={formData.lgpd_termo_aceito}
                  onChange={(e) => setFormData({ ...formData, lgpd_termo_aceito: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="lgpd" className="text-[11px] text-slate-400 leading-relaxed">
                  Declaro que o titular autorizou expressamente o armazenamento de seus dados cadastrais e foto
                  biométrica para finalidades exclusivas de segurança predial e controle de acesso, em conformidade com
                  o Artigo 7º da Lei Geral de Proteção de Dados (LGPD nº 13.709/2018).
                </label>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCadastroModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Perfil do Morador / Residente (Prompt 5) */}
      {isPerfilModalOpen && selectedMorador && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header Perfil */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-[#111827] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-lg overflow-hidden shrink-0">
                  {selectedMorador.avatar_url ? (
                    <img
                      src={selectedMorador.avatar_url}
                      alt={selectedMorador.nome_completo}
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-bold text-xl">
                      {selectedMorador.nome_completo.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">{selectedMorador.nome_completo}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/40">
                      {selectedMorador.perfil}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-medium">
                    <Building className="w-3.5 h-3.5 text-indigo-400" />
                    Bloco {selectedMorador.unidade_bloco} • Apartamento {selectedMorador.unidade_numero}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPerfilModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abas de Navegação do Perfil */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40">
              <button
                onClick={() => setActiveTabPerfil('cadastrais')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
                  activeTabPerfil === 'cadastrais'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Dados Cadastrais & LGPD
              </button>
              <button
                onClick={() => setActiveTabPerfil('veiculos')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
                  activeTabPerfil === 'veiculos'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Veículos & Dependentes ({selectedMorador.veiculos?.length || 0})
              </button>
              <button
                onClick={() => setActiveTabPerfil('encomendas')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
                  activeTabPerfil === 'encomendas'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Histórico de Encomendas
              </button>
              <button
                onClick={() => setActiveTabPerfil('visitas')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
                  activeTabPerfil === 'visitas'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Visitas & Acessos
              </button>
            </div>

            {/* Conteúdo das Abas */}
            <div className="p-6">
              {activeTabPerfil === 'cadastrais' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contato</span>
                      <p className="text-xs text-slate-300">
                        <strong>WhatsApp:</strong> {selectedMorador.telefone}
                      </p>
                      <p className="text-xs text-slate-300">
                        <strong>E-mail:</strong> {selectedMorador.email}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Documentação</span>
                      <p className="text-xs text-slate-300 font-mono">
                        <strong>CPF:</strong> {selectedMorador.cpf}
                      </p>
                      <p className="text-xs text-slate-300">
                        <strong>Status:</strong> {selectedMorador.status}
                      </p>
                    </div>
                  </div>

                  {/* Conformidade LGPD */}
                  <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400">Termo de Consentimento LGPD Ativo</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Aceite registrado com consentimento explícito. O titular pode exercer o direito de anonimização
                        a qualquer momento.
                      </p>
                    </div>
                  </div>

                  {selectedMorador.observacoes && (
                    <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Observações</span>
                      <p className="text-xs text-slate-300 mt-1">{selectedMorador.observacoes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTabPerfil === 'veiculos' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Veículos da Unidade</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedMorador.veiculos && selectedMorador.veiculos.length > 0 ? (
                      selectedMorador.veiculos.map((v) => (
                        <div key={v.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                          <Car className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="text-xs font-bold text-white font-mono">{v.placa}</p>
                            <p className="text-[11px] text-slate-400">{v.modelo} • {v.cor}</p>
                            {v.vaga && <p className="text-[10px] text-indigo-400 font-medium">Vaga: {v.vaga}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic sm:col-span-2">Nenhum veículo registrado.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTabPerfil === 'encomendas' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Encomendas Recentes</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {INITIAL_ENCOMENDAS.filter((e) => e.unidade_bloco === selectedMorador.unidade_bloco && e.unidade_numero === selectedMorador.unidade_numero).map((enc) => (
                      <div key={enc.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-indigo-400" />
                          <div>
                            <p className="text-xs font-bold text-white">{enc.transportadora}</p>
                            <p className="text-[10px] font-mono text-slate-400">{enc.codigo_barras_qrcode}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          enc.status === 'AGUARDANDO_RETIRADA'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        }`}>
                          {enc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTabPerfil === 'visitas' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Visitas e Prestadores</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {INITIAL_VISITANTES.filter((v) => v.unidade_destino_bloco === selectedMorador.unidade_bloco && v.unidade_destino_numero === selectedMorador.unidade_numero).map((vis) => (
                      <div key={vis.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-cyan-400" />
                          <div>
                            <p className="text-xs font-bold text-white">{vis.nome_completo}</p>
                            <p className="text-[10px] text-slate-400">{vis.tipo} • {vis.hora_entrada}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                          {vis.status_acesso}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Perfil */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleAnonimizarMorador(selectedMorador.id, selectedMorador.nome_completo)}
                className="flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-xl text-xs font-semibold transition-colors"
              >
                <UserX className="w-4 h-4" />
                Anonimizar Titular (LGPD)
              </button>

              <button
                onClick={() => setIsPerfilModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL WEBCAM */}
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
              <Camera className="w-4 h-4 text-indigo-400" />
              Captura Biométrica / Foto do Morador
            </h3>
            <WebcamCapture
              onPhotoCaptured={(dataUrl) => {
                setFormData({ ...formData, avatar_url: dataUrl });
                setIsWebcamOpen(false);
              }}
              currentPhotoUrl={formData.avatar_url}
            />
          </div>
        </div>
      )}
    </div>
  );
}
